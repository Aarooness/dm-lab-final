module.exports = {
  id: 'pack-bienestar',
  name: 'Pack bienestar −S/10',
  description: 'Creatina + multivitamínico: ahorra S/10 en el multivitamínico.',
  bundle: ['creatine', 'vitamins'],
  badge: '−S/10',

  apply({ items }) {
    const hasCreatine = items.some(item => item.id === 'creatine');
    const hasVitamins = items.some(item => item.id === 'vitamins');
    const eligible = hasCreatine && hasVitamins;
    return {
      discounts: eligible ? { vitamins: 10 } : {},
      reason: eligible
        ? 'S/10 descontados en el multivitamínico.'
        : 'Agrega creatina y un multivitamínico para aplicar la oferta.'
    };
  }
};
