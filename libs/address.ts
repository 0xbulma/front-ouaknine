// The address block stores the street and the phone on two lines, the second
// one prefixed with its own label ("Tél. : ", "Tel: "), which would repeat a
// label rendered above it.
export const splitAddress = (
  address: string | null | undefined
): { street: string; phone: string } => {
  const [street = '', phoneLine = ''] = (address ?? '').split('\n');
  return { street, phone: phoneLine.replace(/^[^:]*:\s*/, '') };
};
