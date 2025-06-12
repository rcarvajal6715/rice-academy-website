// lib/utils.js

/**
 * Simple class-names joiner: filters out falsy values and joins the rest.
 *
 * @param  {...(string|false|undefined|null)} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}