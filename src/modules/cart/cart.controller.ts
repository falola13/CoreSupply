import { JwtAuthGuard } from 'src/common/guards/jwt.auth-guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CreateCartDto } from './dto/create-cart.dto';
import { CartApiResponseDto, CartResponseDto } from './dto/cart-response.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { ModerateThrottle } from 'src/common/decorators/custom-throttler.decorator';
import { RoleGuard } from 'src/common/guards/roles.guard';

@ApiTags('cart')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  //   Create cart
  @Post('/items')
  @ModerateThrottle()
  @ApiOperation({ summary: 'Create or update a cart item' })
  @ApiProperty({ description: 'Create a new cart item' })
  @ApiOkResponse({
    type: CartApiResponseDto<CartResponseDto>,
  })
  @ApiCreatedResponse({
    description: 'Cart item created successfully',
    type: CartApiResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({
    description: 'Cart not found ',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests - rate limit exceeded',
  })
  async CreateCart(
    @Body() createCartDto: CreateCartDto,
    @GetUser('id') userId: string,
  ) {
    return await this.cartService.create(userId, createCartDto);
  }

  // Cart count
  @Get('count')
  @ApiOperation({ summary: 'Get cart count' })
  @ApiNotFoundResponse({ description: 'Cart not found' })
  async cartCount(@GetUser('id') userId: string) {
    return await this.cartService.cartCount(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get active cart' })
  @ApiOkResponse({ type: CartApiResponseDto<CartResponseDto> })
  async getCart(@GetUser('id') userId: string) {
    return await this.cartService.getCart(userId);
  }

  @Put('/items')
  @ModerateThrottle()
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiOkResponse({ type: CartApiResponseDto<CartResponseDto> })
  async updateCart(
    @Body() updateCartDto: CreateCartDto,
    @GetUser('id') userId: string,
  ) {
    return await this.cartService.update(userId, updateCartDto);
  }

  @Post('/checkout')
  @ModerateThrottle()
  @ApiOperation({ summary: 'Checkout active cart and create order' })
  @ApiOkResponse({ description: 'Order created successfully' })
  async checkout(
    @Body() checkoutDto: CheckoutDto,
    @GetUser('id') userId: string,
  ) {
    return await this.cartService.checkout(userId, checkoutDto);
  }

  // Delete Product from cart
  @Delete('/items/:id')
  @ApiOkResponse({ description: 'Product removed from cart successful' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async deleteProduct(@Param('id') id: string, @GetUser('id') userId: string) {
    return await this.cartService.deleteProduct(id, userId);
  }
}
