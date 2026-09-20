export const formatCurrency = (priceCp: number) => {
  const goldPieces = Math.floor(priceCp / 100);
  const silverPieces = Math.floor((priceCp % 100) / 10);
  const copperPieces = priceCp % 10;
  return [goldPieces ? `${goldPieces} po` : "", silverPieces ? `${silverPieces} pa` : "", copperPieces ? `${copperPieces} pc` : ""].filter(Boolean).join(" ") || "0 pc";
};
