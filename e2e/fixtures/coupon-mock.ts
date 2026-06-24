export const MOCK_COUPON_VALID = {
  valid: true,
  coupon_code: 'PROMO10',
  discount_type: 'percentage',
  discount_value: 10,
  discount_amount: 2.5,
  final_value: 22.5,
};

export const MOCK_COUPON_EXPIRED = {
  detail: 'Coupon has expired',
};

export const MOCK_COUPON_LIMIT = {
  detail: 'Coupon usage limit reached',
};

export const MOCK_COUPON_INACTIVE = {
  detail: 'Coupon is inactive',
};

export const MOCK_COUPON_NOT_FOUND = {
  detail: 'Coupon not found',
};

export const MOCK_COUPON_MIN_NOT_MET = {
  detail: 'Minimum order value of R$ 50.00 not met',
};
