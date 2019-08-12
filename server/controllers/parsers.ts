
export const parsers = {
  Float: parseFloat,
  Int: parseInt,
  Integer: parseInt,
  Date: s => new Date(s),
  String: s => s,
  Location: s => ({type: 'Point', coordinates: s.split(',').map(parseFloat).reverse()}),
  'geo:point': s => ({type: 'Point', coordinates: s.split(',').map(parseFloat).reverse()})
};
