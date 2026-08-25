// $space-7 worth of clearance below the sticky header (72px tall).
const HEADER_CLEARANCE = 96;

const scrollTo = (elID, offset = HEADER_CLEARANCE) => {
  if (elID) {
    const el = document.getElementById(elID);
    if (!el) return;
    globalThis.scrollTo({
      top: el.getBoundingClientRect().top + globalThis.scrollY - offset,
      behavior: 'smooth',
    });
  }
};

export default scrollTo;
