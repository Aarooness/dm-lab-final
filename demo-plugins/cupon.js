module.exports = {
 id: 'cupon', name: 'Cupón S/5', description: 'S/5 en whey desde S/50', bundle: ['whey'], badge: 'S/5',
 apply: ({items,subtotal}) => {const ok=subtotal>=50&&items.some(p=>p.id==='whey');return {discounts:{whey:ok?5:0},reason:ok?'S/5 descontados de whey.':'Agrega whey y alcanza S/50.'}}
};
