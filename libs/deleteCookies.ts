// Clears every cookie on the apex domain, for a visitor who has just declined
// analytics. Called from the cookie context, so it only ever runs in a browser.
function deleteAllCookies(): void {
  for (const cookie of document.cookie.split(';')) {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.slice(0, eqPos) : cookie;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.${process.env.NEXT_PUBLIC_HOSTNAME}`;
  }
}

export default deleteAllCookies;
