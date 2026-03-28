// notionists — original style, all forced to men via beard variant.
const BASE = 'https://api.dicebear.com/9.x/notionists/svg';

const avatar = (seed, backgroundColor, beard = 'variant01') => {
  const params = { seed, backgroundColor, beard };
  return `${BASE}?${new URLSearchParams(params)}`;
};

export const PERSON_AVATARS = {
  'sai charan': avatar('sai-charan', 'ffd6a5', 'variant05'),
  'aditya':     avatar('aditya',     'caffbf', 'variant03'),
  'saaketh':    avatar('saaketh',    'bde0fe', 'variant08'),
  'prudhvi':    avatar('prudhvi',    'ffc8dd', 'variant02'),
  'harshith':   avatar('harshith',   'e8d5b7', 'variant10'),
  'rakesh':     avatar('rakesh',     'd4e4bc', 'variant04'),
  'vinay':      avatar('vinay',      'c5b4e3', 'variant01'),
};

export function getAvatarUrl(name) {
  const key = name.trim().toLowerCase();
  return PERSON_AVATARS[key] ?? avatar(key, 'b6e3f4', 'variant01');
}
