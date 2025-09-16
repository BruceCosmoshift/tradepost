export const ZA_PROVINCES = [
  "Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga",
  "Northern Cape","North West","Western Cape"
] as const;

export const ZA_PROVINCE_CITIES: Record<string,string[]> = {
  "Gauteng": ["Johannesburg","Pretoria","Sandton","Soweto","Centurion","Boksburg","Benoni","Krugersdorp"],
  "Western Cape": ["Cape Town","Stellenbosch","Paarl","George","Somerset West","Worcester"],
  "KwaZulu-Natal": ["Durban","Pietermaritzburg","Umhlanga","Pinetown","Ballito","Richards Bay"],
  "Eastern Cape": ["Gqeberha","East London","Makhanda","Mthatha","Queenstown"],
  "Free State": ["Bloemfontein","Welkom","Sasolburg","Harrismith","Kroonstad"],
  "Limpopo": ["Polokwane","Tzaneen","Thohoyandou","Lephalale","Mokopane"],
  "Mpumalanga": ["Mbombela","Middelburg","Witbank","Secunda","Ermelo"],
  "North West": ["Mahikeng","Rustenburg","Klerksdorp","Potchefstroom","Brits"],
  "Northern Cape": ["Kimberley","Upington","Kuruman","Springbok"]
};