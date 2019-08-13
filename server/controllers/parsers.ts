
export const parsers = {
  float: parseFloat,
  int: parseInt,
  integer: parseInt,
  date: s => new Date(s),
  string: s => s,
  location: s => ({type: 'Point', coordinates: s.split(',').map(parseFloat).reverse()}),
  'geo:point': s => ({type: 'Point', coordinates: s.split(',').map(parseFloat).reverse()})
};
