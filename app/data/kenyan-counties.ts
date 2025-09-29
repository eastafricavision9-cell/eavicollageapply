// Complete list of all 47 Kenyan counties organized by regions
export const kenyanCounties = [
  // Central Kenya
  { value: "Kiambu", label: "Kiambu County", region: "Central" },
  { value: "Murang'a", label: "Murang'a County", region: "Central" },
  { value: "Nyeri", label: "Nyeri County", region: "Central" },
  { value: "Kirinyaga", label: "Kirinyaga County", region: "Central" },
  { value: "Nyandarua", label: "Nyandarua County", region: "Central" },

  // Nairobi Region
  { value: "Nairobi", label: "Nairobi County", region: "Nairobi" },

  // Coast Region
  { value: "Mombasa", label: "Mombasa County", region: "Coast" },
  { value: "Kwale", label: "Kwale County", region: "Coast" },
  { value: "Kilifi", label: "Kilifi County", region: "Coast" },
  { value: "Tana River", label: "Tana River County", region: "Coast" },
  { value: "Lamu", label: "Lamu County", region: "Coast" },
  { value: "Taita-Taveta", label: "Taita-Taveta County", region: "Coast" },

  // Eastern Region
  { value: "Machakos", label: "Machakos County", region: "Eastern" },
  { value: "Makueni", label: "Makueni County", region: "Eastern" },
  { value: "Kitui", label: "Kitui County", region: "Eastern" },
  { value: "Embu", label: "Embu County", region: "Eastern" },
  { value: "Tharaka-Nithi", label: "Tharaka-Nithi County", region: "Eastern" },
  { value: "Meru", label: "Meru County", region: "Eastern" },
  { value: "Isiolo", label: "Isiolo County", region: "Eastern" },
  { value: "Marsabit", label: "Marsabit County", region: "Eastern" },

  // North Eastern Region
  { value: "Garissa", label: "Garissa County", region: "North Eastern" },
  { value: "Wajir", label: "Wajir County", region: "North Eastern" },
  { value: "Mandera", label: "Mandera County", region: "North Eastern" },

  // Northern Region
  { value: "Samburu", label: "Samburu County", region: "Northern" },
  { value: "Turkana", label: "Turkana County", region: "Northern" },

  // Rift Valley Region
  { value: "Nakuru", label: "Nakuru County", region: "Rift Valley" },
  { value: "Uasin Gishu", label: "Uasin Gishu County", region: "Rift Valley" },
  { value: "Trans Nzoia", label: "Trans Nzoia County", region: "Rift Valley" },
  { value: "Elgeyo-Marakwet", label: "Elgeyo-Marakwet County", region: "Rift Valley" },
  { value: "Nandi", label: "Nandi County", region: "Rift Valley" },
  { value: "Baringo", label: "Baringo County", region: "Rift Valley" },
  { value: "Laikipia", label: "Laikipia County", region: "Rift Valley" },
  { value: "West Pokot", label: "West Pokot County", region: "Rift Valley" },
  { value: "Kajiado", label: "Kajiado County", region: "Rift Valley" },
  { value: "Kericho", label: "Kericho County", region: "Rift Valley" },
  { value: "Bomet", label: "Bomet County", region: "Rift Valley" },
  { value: "Narok", label: "Narok County", region: "Rift Valley" },

  // Western Region
  { value: "Kakamega", label: "Kakamega County", region: "Western" },
  { value: "Vihiga", label: "Vihiga County", region: "Western" },
  { value: "Bungoma", label: "Bungoma County", region: "Western" },
  { value: "Busia", label: "Busia County", region: "Western" },

  // Nyanza Region
  { value: "Siaya", label: "Siaya County", region: "Nyanza" },
  { value: "Kisumu", label: "Kisumu County", region: "Nyanza" },
  { value: "Homa Bay", label: "Homa Bay County", region: "Nyanza" },
  { value: "Migori", label: "Migori County", region: "Nyanza" },
  { value: "Kisii", label: "Kisii County", region: "Nyanza" },
  { value: "Nyamira", label: "Nyamira County", region: "Nyanza" }
]

// Group counties by region for easier organization in dropdowns
export const countiesByRegion = kenyanCounties.reduce((acc, county) => {
  if (!acc[county.region]) {
    acc[county.region] = []
  }
  acc[county.region].push(county)
  return acc
}, {} as Record<string, typeof kenyanCounties>)

// Get all county names as a simple array
export const countyNames = kenyanCounties.map(county => county.value)

// Get all region names
export const regionNames = [...new Set(kenyanCounties.map(county => county.region))]

// Helper function to find county by value
export const findCountyByValue = (value: string) => {
  return kenyanCounties.find(county => county.value === value)
}

// Helper function to get counties in a specific region
export const getCountiesInRegion = (regionName: string) => {
  return kenyanCounties.filter(county => county.region === regionName)
}