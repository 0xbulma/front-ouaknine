import { createContext } from 'react';

// Which languages the page on screen actually exists in.
//
// The head already gets this right: a French-only publication emits one hreflang
// and no English alternate. The language switcher had no way to know, so it went
// on offering a link to a page that does not exist. This carries the same answer
// from the page down to the picker.
//
// Null means "no page said", and the picker falls back to its old behaviour of
// assuming the same path exists in both.
export const LocalesContextSchema = createContext(null);

function LocalesContext({ value, children }) {
  return (
    <LocalesContextSchema.Provider value={value}>
      {children}
    </LocalesContextSchema.Provider>
  );
}

export default LocalesContext;
