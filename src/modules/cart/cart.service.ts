import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { CartApiResponseDto, CartResponseDto } from './dto/cart-response.dto';
import { Cart, CartItem, Product } from '@prisma/client';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // Create or update cart
  async create(
    userId: string,
    createCartDto: CreateCartDto,
  ): Promise<CartApiResponseDto<CartResponseDto>> {
    const { productId, quantity } = createCartDto;

    return await this.prisma.$transaction(async (tx) => {
      // 1. Check Product & Stock
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) throw new NotFoundException(`Product not found`);
      if (product.stock < quantity) {
        throw new NotFoundException(
          `Only ${product.stock} items left in stock`,
        );
      }

      // 2. Get or Create Active Cart
      let cart = await tx.cart.findFirst({
        where: { userId: userId, checkedOut: false },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: { userId: userId, checkedOut: false },
        });
      }

      const existingCartItem = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: productId,
          },
        },
      });

      if (
        existingCartItem &&
        existingCartItem?.quantity + quantity > product.stock
      ) {
        throw new BadRequestException(
          `The quantity has already exceeded the product stock of ${product.stock} `,
        );
      }

      // 3. Upsert Cart Item
      // IMPORTANT: Ensure your schema has @@unique([cartId, productId])
      await tx.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: productId,
          },
        },
        update: {
          quantity: { increment: quantity },
        },
        create: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
      const fullCart = await tx.cart.findUnique({
        where: { id: cart.id, userId: userId },
        include: {
          cartItems: {
            include: { product: true },
          },
        },
      });
      if (!fullCart) {
        throw new NotFoundException('Could not retrieve cart after update');
      }

      return {
        success: true,
        data: this.mapToCartResponse(fullCart),
        message: `Cart updated successfully ${userId}`,
      };
    });
  }

  // Checkout cart -> create Order and OrderItems, decrement stock, mark cart checked out
  async checkout(
    userId: string,
    checkoutDto: CheckoutDto,
  ): Promise<{
    success: boolean;
    data: { orderId: string; orderNumber: string; totalAmount: number };
    message: string;
  }> {
    const { shippingAddress } = checkoutDto;

    return await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findFirst({
        where: { userId: userId, checkedOut: false },
        include: { cartItems: { include: { product: true } } },
      });

      if (!cart) {
        throw new NotFoundException('No active cart found for this user');
      }

      if (!cart.cartItems || cart.cartItems.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      // Calculate total
      const total = cart.cartItems.reduce((acc, it) => {
        const price = Number(it.product.price);
        return acc + price * it.quantity;
      }, 0);

      const order = await tx.order.create({
        data: {
          status: 'PENDING',
          totalAmount: total,
          userId: userId,
          cartId: cart.id,
          shippingAddress: shippingAddress ?? null,
        },
      });

      // create order items and decrement stock
      for (const item of cart.cartItems) {
        await tx.orderItem.create({
          data: {
            quantity: item.quantity,
            price: item.product.price,
            productId: item.productId,
            orderId: order.id,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cart.update({
        where: { id: cart.id },
        data: { checkedOut: true },
      });

      return {
        success: true,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: Number(order.totalAmount),
        },
        message: 'Order created successfully',
      };
    });
  }

  // Get cart count
  async cartCount(userId: string): Promise<{
    success: boolean;
    count: number;
    message;
  }> {
    const cart = await this.prisma.cart.findFirst({
      where: { userId: userId, checkedOut: false },
      include: {
        _count: true,
      },
    });

    if (!cart) {
      throw new NotFoundException('No active cart found for this user');
    }

    const cartCount = cart._count.cartItems;

    return {
      success: true,
      count: cartCount,
      message: 'Cart count retrieved successfully',
    };
  }

  // Get active cart
  async getCart(userId: string): Promise<CartApiResponseDto<CartResponseDto>> {
    const cart = await this.prisma.cart.findFirst({
      where: { userId: userId, checkedOut: false },
      include: {
        cartItems: { include: { product: true } },
      },
    });

    if (!cart) {
      throw new NotFoundException('No active cart found for this user');
    }

    return {
      success: true,
      data: this.mapToCartResponse(cart),
      message: 'Cart retrieved successfully',
    };
  }

  // Update cart item quantity (sets quantity; if quantity is 0 it removes the item)
  async update(
    userId: string,
    createCartDto: CreateCartDto,
  ): Promise<CartApiResponseDto<CartResponseDto>> {
    const { productId, quantity } = createCartDto;

    if (quantity < 0) {
      throw new BadRequestException('Quantity must be 0 or greater');
    }

    return await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new NotFoundException('Product not found');
      if (quantity > product.stock) {
        throw new BadRequestException(
          `Only ${product.stock} items left in stock`,
        );
      }

      let cart = await tx.cart.findFirst({
        where: { userId: userId, checkedOut: false },
      });
      if (!cart) {
        if (quantity === 0) {
          throw new NotFoundException('Cart not found');
        }
        cart = await tx.cart.create({
          data: { userId: userId, checkedOut: false },
        });
      }

      const existingCartItem = await tx.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId } },
      });

      if (existingCartItem) {
        if (quantity === 0) {
          await tx.cartItem.delete({
            where: { cartId_productId: { cartId: cart.id, productId } },
          });
        } else {
          await tx.cartItem.update({
            where: { cartId_productId: { cartId: cart.id, productId } },
            data: { quantity },
          });
        }
      } else {
        if (quantity === 0) {
          // nothing to do
        } else {
          await tx.cartItem.create({
            data: { cartId: cart.id, productId, quantity },
          });
        }
      }

      const fullCart = await tx.cart.findUnique({
        where: { id: cart.id },
        include: { cartItems: { include: { product: true } } },
      });

      if (!fullCart)
        throw new NotFoundException('Could not retrieve cart after update');

      return {
        success: true,
        data: this.mapToCartResponse(fullCart),
        message: 'Cart updated successfully',
      };
    });
  }

  // delete product from cart
  async deleteProduct(
    id: string,
    userId: string,
  ): Promise<{
    success: boolean;
    data: CartResponseDto;
    message: string;
  }> {
    const product = await this.prisma.product.findFirst({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product does not exist');
    }

    const cart = await this.prisma.cart.findFirst({
      where: { userId: userId, checkedOut: false },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const existingCartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: id,
        },
      },
    });

    if (!existingCartItem) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: id,
        },
      },
    });

    const fullCart = await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: { cartItems: { include: { product: true } } },
    });

    return {
      success: true,
      data: this.mapToCartResponse(fullCart ?? cart),
      message: 'Product deleted from cart successfully',
    };
  }

  private mapToCartResponse(
    cart: Cart & { cartItems: (CartItem & { product: Product })[] },
  ): CartResponseDto {
    return {
      id: cart.id,
      userId: cart.userId ?? '',
      item: cart.cartItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        productId: item.productId,
        stock: item.product.stock,
        imageUrl: item.product.imageUrl,
        isActive: item.product.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}
