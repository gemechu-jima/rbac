export type SortOrder = "asc" | "desc";

export function universalSort<T>(
  array: T[],
  key: keyof T,
  order: SortOrder = "asc"
): T[] {
  return [...array].sort((a, b) => {

    const valA = a[key];
    const valB = b[key];

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dateA = new Date(valA as any);
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dateB = new Date(valB as any);

    const isDateA = !isNaN(dateA.getTime());
    const isDateB = !isNaN(dateB.getTime());

    if (isDateA && isDateB) {
      const result = dateA.getTime() - dateB.getTime();
      return order === "desc" ? -result : result;
    }

    const numA = Number(valA);
    const numB = Number(valB);
    const isNumberA = !isNaN(numA);
    const isNumberB = !isNaN(numB);

    if (isNumberA && isNumberB) {
      const result = numA - numB;
      return order === "desc" ? -result : result;
    }


    const strA = String(valA).toLowerCase();
    const strB = String(valB).toLowerCase();

    const result = strA.localeCompare(strB);
    return order === "desc" ? -result : result;
  });
}
