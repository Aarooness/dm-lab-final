module.exports = {
  id: 'proteina-aislada',
  name: 'Whey aislada −10%',
  description: '10% de descuento en las unidades de whey aislada del carrito.',
  bundle: ['isolate'],
  badge: '−10%',

  apply({ items }) {
    const isolate = items.find(item => item.id === 'isolate');
    if (!isolate) {
      return { discounts: {}, reason: 'Agrega whey aislada para aplicar el descuento.' };
    }
    const discount = Math.round(isolate.price * isolate.qty * 10) / 100;
    return {
      discounts: { isolate: discount },
      reason: '10% aplicado a la whey aislada.'
    };
  }
};
