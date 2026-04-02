/*
    ============================================================================
    AweddenStudio - Colour Details Artwork Generator
    Version: 1.2
    Target: Adobe Illustrator ExtendScript (JSX)
    ============================================================================
    REAL WORKFLOW NOTE
    ----------------------------------------------------------------------------
    This script uses only Illustrator-supported scripting behavior.

    Colour input methods:
    1) Selected Object Fill
       - reads fill colour from selected object #1 to #5 in active document
    2) Swatch
       - reads a chosen document swatch for each enabled slot
    3) Manual RGB
       - uses typed RGB values for each enabled slot

    IMPORTANT
    ----------------------------------------------------------------------------
    Illustrator scripting cannot reliably parse an arbitrary PDF colour reference
    at runtime for structured colour naming. So this script is designed to use
    an embedded Color World dataset.

    Replace / extend RAW_COLOR_WORLD_DATA with your full extracted PDF dataset
    for full coverage.

    OUTPUT
    ----------------------------------------------------------------------------
    - Creates one editable 1080 x 1350 px artwork
    - Places it near the active artboard
    - Keeps shapes and text editable
    ============================================================================
*/

(function () {
    if (app.name !== "Adobe Illustrator") {
        alert("This script must be run from Adobe Illustrator.");
        return;
    }

    var SCRIPT_NAME = "AweddenStudio";
    var SCRIPT_VERSION = "1.1";
    var OUTPUT_W = 1080;
    var OUTPUT_H = 1350;
    var MAX_SLOTS = 5;
    var DEFAULT_FONT_FALLBACKS = [
        "ArialMT",
        "MyriadPro-Regular",
        "Helvetica",
        "HelveticaNeue",
        "Verdana",
        "Tahoma"
    ];

    /*
        =========================================================================
        INSERT / EXTEND FULL COLOR WORLD DATASET HERE
        FORMAT:
        Colour Name|R,G,B|HEX
        =========================================================================
    */
    var RAW_COLOR_WORLD_DATA = [
        "Black|0,0,0|000000",
    "Navy Blue|0,0,128|000080",
    "Dark Blue|0,0,200|0000C8",
    "Blue|0,0,255|0000FF",
    "Stratos|0,7,65|000741",
    "Swamp|0,27,28|001B1C",
    "Resolution Blue|0,35,135|002387",
    "Deep Fir|0,41,0|002900",
    "Burnham|0,46,32|002E20",
    "International Klein Blue|0,47,167|002FA7",
    "Prussian Blue|0,49,83|003153",
    "Midnight Blue|0,51,102|003366",
    "Smalt|0,51,153|003399",
    "Deep Teal|0,53,50|003532",
    "Cyprus|0,62,64|003E40",
    "Kaitoke Green|0,70,32|004620",
    "Cobalt|0,71,171|0047AB",
    "Crusoe|0,72,22|004816",
    "Sherpa Blue|0,73,80|004950",
    "Endeavour|0,86,167|0056A7",
    "Camarone|0,88,26|00581A",
    "Science Blue|0,102,204|0066CC",
    "Blue Ribbon|0,102,255|0066FF",
    "Tropical Rain Forest|0,117,94|00755E",
    "Allports|0,118,163|0076A3",
    "Deep Cerulean|0,123,167|007BA7",
    "Lochmara|0,126,199|007EC7",
    "Azure Radiance|0,127,255|007FFF",
    "Teal|0,128,128|008080",
    "Bondi Blue|0,149,182|0095B6",
    "Pacific Blue|0,157,196|009DC4",
    "Persian Green|0,166,147|00A693",
    "Jade|0,168,107|00A86B",
    "Caribbean Green|0,204,153|00CC99",
    "Robin's Egg Blue|0,204,204|00CCCC",
    "Green|0,255,0|00FF00",
    "Spring Green|0,255,127|00FF7F",
    "Cyan / Aqua|0,255,255|00FFFF",
    "Blue Charcoal|1,13,26|010D1A",
    "Midnight|1,22,53|011635",
    "Holly|1,29,19|011D13",
    "Daintree|1,39,49|012731",
    "Cardin Green|1,54,28|01361C",
    "County Green|1,55,26|01371A",
    "Astronaut Blue|1,62,98|013E62",
    "Regal Blue|1,63,106|013F6A",
    "Aqua Deep|1,75,67|014B43",
    "Orient|1,94,133|015E85",
    "Blue Stone|1,97,98|016162",
    "Fun Green|1,109,57|016D39",
    "Pine Green|1,121,111|01796F",
    "Blue Lagoon|1,121,135|017987",
    "Deep Sea|1,130,107|01826B",
    "Green Haze|1,163,104|01A368",
    "English Holly|2,45,21|022D15",
    "Sherwood Green|2,64,44|02402C",
    "Congress Blue|2,71,142|02478E",
    "Evening Sea|2,78,70|024E46",
    "Bahama Blue|2,99,149|026395",
    "Observatory|2,134,111|02866F",
    "Cerulean|2,164,211|02A4D3",
    "Tangaroa|3,22,60|03163C",
    "Green Vogue|3,43,82|032B52",
    "Mosque|3,106,110|036A6E",
    "Midnight Moss|4,16,4|041004",
    "Black Pearl|4,19,34|041322",
    "Blue Whale|4,46,76|042E4C",
    "Zuccini|4,64,34|044022",
    "Teal Blue|4,66,89|044259",
    "Deep Cove|5,16,64|051040",
    "Gulf Blue|5,22,87|051657",
    "Venice Blue|5,89,137|055989",
    "Watercourse|5,111,87|056F57",
    "Catalina Blue|6,42,120|062A78",
    "Tiber|6,53,55|063537",
    "Gossamer|6,155,129|069B81",
    "Niagara|6,161,137|06A189",
    "Tarawera|7,58,80|073A50",
    "Jaguar|8,1,16|080110",
    "Black Bean|8,25,16|081910",
    "Deep Sapphire|8,37,103|082567",
    "Elf Green|8,131,112|088370",
    "Bright Turquoise|8,232,222|08E8DE",
    "Downriver|9,34,86|092256",
    "Palm Green|9,35,15|09230F",
    "Madison|9,37,93|09255D",
    "Bottle Green|9,54,36|093624",
    "Deep Sea Green|9,88,89|095859",
    "Salem|9,127,75|097F4B",
    "Black Russian|10,0,28|0A001C",
    "Dark Fern|10,72,13|0A480D",
    "Japanese Laurel|10,105,6|0A6906",
    "Atoll|10,111,117|0A6F75",
    "Cod Gray|11,11,11|0B0B0B",
    "Marshland|11,15,8|0B0F08",
    "Gordons Green|11,17,7|0B1107",
    "Black Forest|11,19,4|0B1304",
    "San Felix|11,98,7|0B6207",
    "Malachite|11,218,81|0BDA51",
    "Ebony|12,11,29|0C0B1D",
    "Woodsmoke|12,13,15|0C0D0F",
    "Racing Green|12,25,17|0C1911",
    "Surfie Green|12,122,121|0C7A79",
    "Blue Chill|12,137,144|0C8990",
    "Black Rock|13,3,50|0D0332",
    "Bunker|13,17,23|0D1117",
    "Aztec|13,28,25|0D1C19",
    "Bush|13,46,28|0D2E1C",
    "Cinder|14,14,24|0E0E18",
    "Firefly|14,42,48|0E2A30",
    "Torea Bay|15,45,158|0F2D9E",
    "Vulcan|16,18,29|10121D",
    "Green Waterloo|16,20,5|101405",
    "Eden|16,88,82|105852",
    "Arapawa|17,12,108|110C6C",
    "Ultramarine|18,10,143|120A8F",
    "Elephant|18,52,71|123447",
    "Jewel|18,107,64|126B40",
    "Diesel|19,0,0|130000",
    "Asphalt|19,10,6|130A06",
    "Blue Zodiac|19,38,77|13264D",
    "Parsley|19,79,25|134F19",
    "Nero|20,6,0|140600",
    "Tory Blue|20,80,170|1450AA",
    "Bunting|21,31,76|151F4C",
    "Denim|21,96,189|1560BD",
    "Genoa|21,115,107|15736B",
    "Mirage|22,25,40|161928",
    "Hunter Green|22,29,16|161D10",
    "Big Stone|22,42,64|162A40",
    "Celtic|22,50,34|163222",
    "Timber Green|22,50,44|16322C",
    "Gable Green|22,53,49|163531",
    "Pine Tree|23,31,4|171F04",
    "Chathams Blue|23,85,121|175579",
    "Deep Forest Green|24,45,9|182D09",
    "Blumine|24,88,122|18587A",
    "Palm Leaf|25,51,14|19330E",
    "Nile Blue|25,89,168|1959A8",
    "Lucky Point|26,26,104|1A1A68",
    "Mountain Meadow|26,179,133|1AB385",
    "Tolopea|27,2,69|1B0245",
    "Haiti|27,16,53|1B1035",
    "Deep Koamaru|27,18,123|1B127B",
    "Acadia|27,20,4|1B1404",
    "Seaweed|27,47,17|1B2F11",
    "Biscay|27,49,98|1B3162",
    "Matisse|27,101,157|1B659D",
    "Crowshead|28,18,8|1C1208",
    "Rangoon Green|28,30,19|1C1E13",
    "Persian Blue|28,57,187|1C39BB",
    "Everglade|28,64,46|1C402E",
    "Elm|28,124,125|1C7C7D",
    "Green Pea|29,97,66|1D6142",
    "Creole|30,15,4|1E0F04",
    "Karaka|30,22,9|1E1609",
    "El Paso|30,23,8|1E1708",
    "Cello|30,56,91|1E385B",
    "Te Papa Green|30,67,60|1E433C",
    "Dodger Blue|30,144,255|1E90FF",
    "Eastern Blue|30,154,176|1E9AB0",
    "Night Rider|31,18,15|1F120F",
    "Java|31,194,194|1FC2C2",
    "Jacksons Purple|32,32,141|20208D",
    "Cloud Burst|32,46,84|202E54",
    "Blue Dianne|32,72,82|204852",
    "Eternity|33,26,14|211A0E",
    "Deep Blue|34,8,120|220878",
    "Forest Green|34,139,34|228B22",
    "Mallard|35,52,24|233418",
    "Violet|36,10,64|240A40",
    "Kilamanjaro|36,12,2|240C02",
    "Log Cabin|36,42,29|242A1D",
    "Black Olive|36,46,22|242E16",
    "Green House|36,80,15|24500F",
    "Graphite|37,22,7|251607",
    "Cannon Black|37,23,6|251706",
    "Port Gore|37,31,79|251F4F",
    "Shark|37,39,44|25272C",
    "Green Kelp|37,49,28|25311C",
    "Curious Blue|37,150,209|2596D1",
    "Paua|38,3,104|260368",
    "Paris M|38,5,106|26056A",
    "Wood Bark|38,17,5|261105",
    "Gondola|38,20,20|261414",
    "Steel Gray|38,35,53|262335",
    "Ebony Clay|38,40,59|26283B",
    "Bay of Many|39,58,129|273A81",
    "Plantation|39,80,75|27504B",
    "Eucalyptus|39,138,91|278A5B",
    "Oil|40,30,21|281E15",
    "Astronaut|40,58,119|283A77",
    "Mariner|40,106,205|286ACD",
    "Violent Violet|41,12,94|290C5E",
    "Bastille|41,33,48|292130",
    "Zeus|41,35,25|292319",
    "Charade|41,41,55|292937",
    "Jelly Bean|41,123,154|297B9A",
    "Jungle Green|41,171,135|29AB87",
    "Cherry Pie|42,3,89|2A0359",
    "Coffee Bean|42,20,14|2A140E",
    "Baltic Sea|42,38,48|2A2630",
    "Turtle Green|42,56,11|2A380B",
    "Cerulean Blue|42,82,190|2A52BE",
    "Sepia Black|43,2,2|2B0202",
    "Valhalla|43,25,79|2B194F",
    "Heavy Metal|43,50,40|2B3228",
    "Blue Gem|44,14,140|2C0E8C",
    "Revolver|44,22,50|2C1632",
    "Bleached Cedar|44,33,51|2C2133",
    "Lochinvar|44,140,132|2C8C84",
    "Mikado|45,37,16|2D2510",
    "Outer Space|45,56,58|2D383A",
    "St Tropaz|45,86,155|2D569B",
    "Jacaranda|46,3,41|2E0329",
    "Jacko Bean|46,25,5|2E1905",
    "Rangitoto|46,50,34|2E3222",
    "Rhino|46,63,98|2E3F62",
    "Sea Green|46,139,87|2E8B57",
    "Scooter|46,191,212|2EBFD4",
    "Onion|47,39,14|2F270E",
    "Governor Bay|47,60,179|2F3CB3",
    "Sapphire|47,81,158|2F519E",
    "Spectra|47,90,87|2F5A57",
    "Casal|47,97,104|2F6168",
    "Melanzane|48,5,41|300529",
    "Cocoa Brown|48,31,30|301F1E",
    "Woodrush|48,42,15|302A0F",
    "San Juan|48,75,106|304B6A",
    "Turquoise|48,213,200|30D5C8",
    "Eclipse|49,28,23|311C17",
    "Pickled Bluewood|49,68,89|314459",
    "Azure|49,91,161|315BA1",
    "Calypso|49,114,141|31728D",
    "Paradiso|49,125,130|317D82",
    "Persian Indigo|50,18,122|32127A",
    "Blackcurrant|50,41,58|32293A",
    "Mine Shaft|50,50,50|323232",
    "Stromboli|50,93,82|325D52",
    "Bilbao|50,124,20|327C14",
    "Astral|50,125,160|327DA0",
    "Christalle|51,3,107|33036B",
    "Thunder|51,41,47|33292F",
    "Shamrock|51,204,153|33CC99",
    "Tamarind|52,21,21|341515",
    "Mardi Gras|53,0,54|350036",
    "Valentino|53,14,66|350E42",
    "Jagger|53,14,87|350E57",
    "Tuna|53,53,66|353542",
    "Chambray|53,78,140|354E8C",
    "Martinique|54,48,80|363050",
    "Tuatara|54,53,52|363534",
    "Waiouru|54,60,13|363C0D",
    "Ming|54,116,125|36747D",
    "La Palma|54,135,22|368716",
    "Chocolate|55,2,2|370202",
    "Clinker|55,29,9|371D09",
    "Brown Tumbleweed|55,41,14|37290E",
    "Birch|55,48,33|373021",
    "Oracle|55,116,117|377475",
    "Blue Diamond|56,4,116|380474",
    "Grape|56,26,81|381A51",
    "Dune|56,53,51|383533",
    "Oxford Blue|56,69,85|384555",
    "Clover|56,73,16|384910",
    "Limed Spruce|57,72,81|394851",
    "Dell|57,100,19|396413",
    "Toledo|58,0,32|3A0020",
    "Sambuca|58,32,16|3A2010",
    "Jacarta|58,42,106|3A2A6A",
    "William|58,104,108|3A686C",
    "Killarney|58,106,71|3A6A47",
    "Keppel|58,176,158|3AB09E",
    "Temptress|59,0,11|3B000B",
    "Aubergine|59,9,16|3B0910",
    "Jon|59,31,31|3B1F1F",
    "Treehouse|59,40,32|3B2820",
    "Amazon|59,122,87|3B7A57",
    "Boston Blue|59,145,180|3B91B4",
    "Windsor|60,8,120|3C0878",
    "Rebel|60,18,6|3C1206",
    "Meteorite|60,31,118|3C1F76",
    "Dark Ebony|60,32,5|3C2005",
    "Camouflage|60,57,16|3C3910",
    "Bright Gray|60,65,81|3C4151",
    "Cape Cod|60,68,67|3C4443",
    "Lunar Green|60,73,58|3C493A",
    "Bean|61,12,2|3D0C02",
    "Bistre|61,43,31|3D2B1F",
    "Goblin|61,125,82|3D7D52",
    "Kingfisher Daisy|62,4,128|3E0480",
    "Cedar|62,28,20|3E1C14",
    "English Walnut|62,43,35|3E2B23",
    "Black Marlin|62,44,28|3E2C1C",
    "Ship Gray|62,58,68|3E3A44",
    "Pelorous|62,171,191|3EABBF",
    "Bronze|63,33,9|3F2109",
    "Cola|63,37,0|3F2500",
    "Madras|63,48,2|3F3002",
    "Minsk|63,48,127|3F307F",
    "Cabbage Pont|63,76,58|3F4C3A",
    "Tom Thumb|63,88,59|3F583B",
    "Mineral Green|63,93,83|3F5D53",
    "Puerto Rico|63,193,170|3FC1AA",
    "Harlequin|63,255,0|3FFF00",
    "Brown Pod|64,24,1|401801",
    "Cork|64,41,29|40291D",
    "Masala|64,59,56|403B38",
    "Thatch Green|64,61,25|403D19",
    "Fiord|64,81,105|405169",
    "Viridian|64,130,109|40826D",
    "Chateau Green|64,168,96|40A860",
    "Ripe Plum|65,0,86|410056",
    "Paco|65,31,16|411F10",
    "Deep Oak|65,32,16|412010",
    "Merlin|65,60,55|413C37",
    "Gun Powder|65,66,87|414257",
    "East Bay|65,76,125|414C7D",
    "Royal Blue|65,105,225|4169E1",
    "Ocean Green|65,170,120|41AA78",
    "Burnt Maroon|66,3,3|420303",
    "Lisbon Brown|66,57,33|423921",
    "Faded Jade|66,121,119|427977",
    "Scarlet Gum|67,21,96|431560",
    "Iroko|67,49,32|433120",
    "Armadillo|67,62,55|433E37",
    "River Bed|67,76,89|434C59",
    "Green Leaf|67,106,13|436A0D",
    "Barossa|68,1,45|44012D",
    "Morocco Brown|68,29,0|441D00",
    "Mako|68,73,84|444954",
    "Kelp|69,73,54|454936",
    "San Marino|69,108,172|456CAC",
    "Picton Blue|69,177,232|45B1E8",
    "Loulou|70,11,65|460B41",
    "Crater Brown|70,36,37|462425",
    "Gray Asparagus|70,89,69|465945",
    "Steel Blue|70,130,180|4682B4",
    "Rustic Red|72,4,4|480404",
    "Bulgarian Rose|72,6,7|480607",
    "Clairvoyant|72,6,86|480656",
    "Cocoa Bean|72,28,28|481C1C",
    "Woody Brown|72,49,49|483131",
    "Taupe|72,60,50|483C32",
    "Van Cleef|73,23,12|49170C",
    "Brown Derby|73,38,21|492615",
    "Metallic Bronze|73,55,27|49371B",
    "Verdun Green|73,84,0|495400",
    "Blue Bayoux|73,102,121|496679",
    "Bismark|73,113,131|497183",
    "Bracken|74,42,4|4A2A04",
    "Deep Bronze|74,48,4|4A3004",
    "Mondo|74,60,48|4A3C30",
    "Tundora|74,66,68|4A4244",
    "Gravel|74,68,75|4A444B",
    "Trout|74,78,90|4A4E5A",
    "Pigment Indigo|75,0,130|4B0082",
    "Nandor|75,93,82|4B5D52",
    "Saddle|76,48,36|4C3024",
    "Abbey|76,79,86|4C4F56",
    "Blackberry|77,1,53|4D0135",
    "Cab Sav|77,10,24|4D0A18",
    "Indian Tan|77,30,1|4D1E01",
    "Cowboy|77,40,45|4D282D",
    "Livid Brown|77,40,46|4D282E",
    "Rock|77,56,51|4D3833",
    "Punga|77,61,20|4D3D14",
    "Bronzetone|77,64,15|4D400F",
    "Woodland|77,83,40|4D5328",
    "Mahogany|78,6,6|4E0606",
    "Bossanova|78,42,90|4E2A5A",
    "Matterhorn|78,59,65|4E3B41",
    "Bronze Olive|78,66,12|4E420C",
    "Mulled Wine|78,69,98|4E4562",
    "Axolotl|78,102,73|4E6649",
    "Wedgewood|78,127,158|4E7F9E",
    "Shakespeare|78,171,209|4EABD1",
    "Honey Flower|79,28,112|4F1C70",
    "Daisy Bush|79,35,152|4F2398",
    "Indigo|79,105,198|4F69C6",
    "Fern Green|79,121,66|4F7942",
    "Fruit Salad|79,157,93|4F9D5D",
    "Apple|79,168,61|4FA83D",
    "Mortar|80,67,81|504351",
    "Kashmir Blue|80,112,150|507096",
    "Cutty Sark|80,118,114|507672",
    "Emerald|80,200,120|50C878",
    "Emperor|81,70,73|514649",
    "Chalet Green|81,110,61|516E3D",
    "Como|81,124,102|517C66",
    "Smalt Blue|81,128,143|51808F",
    "Castro|82,0,31|52001F",
    "Maroon Oak|82,12,23|520C17",
    "Gigas|82,60,148|523C94",
    "Voodoo|83,52,85|533455",
    "Victoria|83,68,145|534491",
    "Hippie Green|83,130,75|53824B",
    "Heath|84,16,18|541012",
    "Judge Gray|84,67,51|544333",
    "Fuscous Gray|84,83,77|54534D",
    "Vida Loca|84,144,25|549019",
    "Cioccolato|85,40,12|55280C",
    "Saratoga|85,91,16|555B10",
    "Finlandia|85,109,86|556D56",
    "Havelock Blue|85,144,217|5590D9",
    "Fountain Blue|86,180,190|56B4BE",
    "Spring Leaves|87,131,99|578363",
    "Saddle Brown|88,52,1|583401",
    "Scarpa Flow|88,85,98|585562",
    "Cactus|88,113,86|587156",
    "Hippie Blue|88,154,175|589AAF",
    "Wine Berry|89,29,53|591D35",
    "Brown Bramble|89,40,4|592804",
    "Congo Brown|89,55,55|593737",
    "Millbrook|89,68,51|594433",
    "Waikawa Gray|90,110,156|5A6E9C",
    "Horizon|90,135,160|5A87A0",
    "Jambalaya|91,48,19|5B3013",
    "Bordeaux|92,1,32|5C0120",
    "Mulberry Wood|92,5,54|5C0536",
    "Carnaby Tan|92,46,1|5C2E01",
    "Comet|92,93,117|5C5D75",
    "Redwood|93,30,15|5D1E0F",
    "Don Juan|93,76,81|5D4C51",
    "Chicago|93,92,88|5D5C58",
    "Verdigris|93,94,55|5D5E37",
    "Dingley|93,119,71|5D7747",
    "Breaker Bay|93,161,159|5DA19F",
    "Kabul|94,72,62|5E483E",
    "Hemlock|94,93,59|5E5D3B",
    "Irish Coffee|95,61,38|5F3D26",
    "Mid Gray|95,95,110|5F5F6E",
    "Shuttle Gray|95,102,114|5F6672",
    "Aqua Forest|95,167,119|5FA777",
    "Tradewind|95,179,172|5FB3AC",
    "Horses Neck|96,73,19|604913",
    "Smoky|96,91,115|605B73",
    "Corduroy|96,110,104|606E68",
    "Danube|96,147,209|6093D1",
    "Espresso|97,39,24|612718",
    "Eggplant|97,64,81|614051",
    "Costa Del Sol|97,93,48|615D30",
    "Glade Green|97,132,95|61845F",
    "Buccaneer|98,47,48|622F30",
    "Quincy|98,63,45|623F2D",
    "Butterfly Bush|98,78,154|624E9A",
    "West Coast|98,81,25|625119",
    "Finch|98,102,73|626649",
    "Patina|99,154,143|639A8F",
    "Fern|99,183,108|63B76C",
    "Blue Violet|100,86,183|6456B7",
    "Dolphin|100,96,119|646077",
    "Storm Dust|100,100,99|646463",
    "Siam|100,106,84|646A54",
    "Nevada|100,110,117|646E75",
    "Cornflower Blue|100,149,237|6495ED",
    "Viking|100,204,219|64CCDB",
    "Rosewood|101,0,11|65000B",
    "Cherrywood|101,26,20|651A14",
    "Purple Heart|101,45,193|652DC1",
    "Fern Frond|101,114,32|657220",
    "Willow Grove|101,116,93|65745D",
    "Hoki|101,134,159|65869F",
    "Pompadour|102,0,69|660045",
    "Purple|102,0,153|660099",
    "Tyrian Purple|102,2,60|66023C",
    "Dark Tan|102,16,16|661010",
    "Silver Tree|102,181,143|66B58F",
    "Bright Green|102,255,0|66FF00",
    "Screamin' Green|102,255,102|66FF66",
    "Black Rose|103,3,45|67032D",
    "Scampi|103,95,166|675FA6",
    "Ironside Gray|103,102,98|676662",
    "Viridian Green|103,137,117|678975",
    "Christi|103,167,18|67A712",
    "Nutmeg Wood Finish|104,54,0|683600",
    "Zambezi|104,85,88|685558",
    "Salt Box|104,94,110|685E6E",
    "Tawny Port|105,37,69|692545",
    "Finn|105,45,84|692D54",
    "Scorpion|105,95,98|695F62",
    "Lynch|105,126,154|697E9A",
    "Spice|106,68,46|6A442E",
    "Himalaya|106,93,27|6A5D1B",
    "Soya Bean|106,96,81|6A6051",
    "Hairy Heath|107,42,20|6B2A14",
    "Royal Purple|107,63,160|6B3FA0",
    "Shingle Fawn|107,78,49|6B4E31",
    "Dorado|107,87,85|6B5755",
    "Bermuda Gray|107,139,162|6B8BA2",
    "Olive Drab|107,142,35|6B8E23",
    "Eminence|108,48,130|6C3082",
    "Turquoise Blue|108,218,231|6CDAE7",
    "Lonestar|109,1,1|6D0101",
    "Pine Cone|109,94,84|6D5E54",
    "Dove Gray|109,108,108|6D6C6C",
    "Juniper|109,146,146|6D9292",
    "Gothic|109,146,161|6D92A1",
    "Red Oxide|110,9,2|6E0902",
    "Moccaccino|110,29,20|6E1D14",
    "Pickled Bean|110,72,38|6E4826",
    "Dallas|110,75,38|6E4B26",
    "Kokoda|110,109,87|6E6D57",
    "Pale Sky|110,119,131|6E7783",
    "Cafe Royale|111,68,12|6F440C",
    "Flint|111,106,97|6F6A61",
    "Highland|111,142,99|6F8E63",
    "Limeade|111,157,2|6F9D02",
    "Downy|111,208,197|6FD0C5",
    "Persian Plum|112,28,28|701C1C",
    "Sepia|112,66,20|704214",
    "Antique Bronze|112,74,7|704A07",
    "Ferra|112,79,80|704F50",
    "Coffee|112,101,85|706555",
    "Slate Gray|112,128,144|708090",
    "Cedar Wood Finish|113,26,0|711A00",
    "Metallic Copper|113,41,29|71291D",
    "Affair|113,70,147|714693",
    "Studio|113,74,178|714AB2",
    "Tobacco Brown|113,93,71|715D47",
    "Yellow Metal|113,107,56|716338",
    "Peat|113,107,86|716B56",
    "Olivetone|113,110,16|716E10",
    "Storm Gray|113,116,134|717486",
    "Sirocco|113,128,128|718080",
    "Aquamarine Blue|113,217,226|71D9E2",
    "Venetian Red|114,1,15|72010F",
    "Old Copper|114,74,47|724A2F",
    "Go Ben|114,109,78|726D4E",
    "Raven|114,123,137|727B89",
    "Seance|115,30,143|731E8F",
    "Raw Umber|115,74,18|734A12",
    "Kimberly|115,108,159|736C9F",
    "Crocodile|115,109,88|736D58",
    "Crete|115,120,41|737829",
    "Xanadu|115,134,120|738678",
    "Spicy Mustard|116,100,13|74640D",
    "Limed Ash|116,125,99|747D63",
    "Rolling Stone|116,125,131|747D83",
    "Blue Smoke|116,136,129|748881",
    "Laurel|116,147,120|749378",
    "Mantis|116,195,101|74C365",
    "Russett|117,90,87|755A57",
    "Deluge|117,99,168|7563A8",
    "Cosmic|118,57,93|76395D",
    "Blue Marguerite|118,102,198|7666C6",
    "Lima|118,189,23|76BD17",
    "Sky Blue|118,215,234|76D7EA",
    "Dark Burgundy|119,15,5|770F05",
    "Crown of Thorns|119,31,31|771F1F",
    "Walnut|119,63,26|773F1A",
    "Pablo|119,111,97|776F61",
    "Pacifika|119,129,32|778120",
    "Oxley|119,158,134|779E86",
    "Pastel Green|119,221,119|77DD77",
    "Japanese Maple|120,1,9|780109",
    "Mocha|120,45,25|782D19",
    "Peanut|120,47,22|782F16",
    "Camouflage Green|120,134,107|78866B",
    "Wasabi|120,138,37|788A25",
    "Ship Cove|120,139,186|788BBA",
    "Sea Nymph|120,163,156|78A39C",
    "Roman Coffee|121,93,76|795D4C",
    "Old Lavender|121,104,120|796878",
    "Rum|121,105,137|796989",
    "Fedora|121,106,120|796A78",
    "Sandstone|121,109,98|796D62",
    "Spray|121,222,236|79DEEC",
    "Siren|122,1,58|7A013A",
    "Fuchsia Blue|122,88,193|7A58C1",
    "Boulder|122,122,122|7A7A7A",
    "Wild Blue Yonder|122,137,184|7A89B8",
    "De York|122,196,136|7AC488",
    "Red Beech|123,56,1|7B3801",
    "Cinnamon|123,63,0|7B3F00",
    "Yukon Gold|123,102,8|7B6608",
    "Tapa|123,120,116|7B7874",
    "Waterloo|123,124,148|7B7C94",
    "Flax Smoke|123,130,101|7B8265",
    "Amulet|123,159,128|7B9F80",
    "Asparagus|123,160,91|7BA05B",
    "Kenyan Copper|124,28,5|7C1C05",
    "Pesto|124,118,49|7C7631",
    "Topaz|124,119,138|7C778A",
    "Concord|124,123,122|7C7B7A",
    "Jumbo|124,123,130|7C7B82",
    "Trendy Green|124,136,26|7C881A",
    "Gumbo|124,161,166|7CA1A6",
    "Acapulco|124,176,161|7CB0A1",
    "Neptune|124,183,187|7CB7BB",
    "Pueblo|125,44,20|7D2C14",
    "Bay Leaf|125,169,141|7DA98D",
    "Malibu|125,200,247|7DC8F7",
    "Bermuda|125,216,198|7DD8C6",
    "Copper Canyon|126,58,21|7E3A15",
    "Claret|127,23,52|7F1734",
    "Peru Tan|127,58,2|7F3A02",
    "Falcon|127,98,109|7F626D",
    "Mobster|127,117,137|7F7589",
    "Moody Blue|127,118,211|7F76D3",
    "Chartreuse|127,255,0|7FFF00",
    "Aquamarine|127,255,212|7FFFD4",
    "Maroon|128,0,0|800000",
    "Rose Bud Cherry|128,11,71|800B47",
    "Falu Red|128,24,24|801818",
    "Red Robin|128,52,31|80341F",
    "Vivid Violet|128,55,144|803790",
    "Russet|128,70,27|80461B",
    "Friar Gray|128,126,121|807E79",
    "Olive|128,128,0|808000",
    "Gray|128,128,128|808080",
    "Gulf Stream|128,179,174|80B3AE",
    "Glacier|128,179,196|80B3C4",
    "Seagull|128,204,234|80CCEA",
    "Nutmeg|129,66,44|81422C",
    "Spicy Pink|129,110,113|816E71",
    "Empress|129,115,119|817377",
    "Spanish Green|129,152,133|819885",
    "Sand Dune|130,111,101|826F65",
    "Gunsmoke|130,134,133|828685",
    "Battleship Gray|130,143,114|828F72",
    "Merlot|131,25,35|831923",
    "Shadow|131,112,80|837050",
    "Chelsea Cucumber|131,170,93|83AA5D",
    "Monte Carlo|131,208,198|83D0C6",
    "Plum|132,49,121|843179",
    "Granny Smith|132,160,160|84A0A0",
    "Chetwode Blue|133,129,217|8581D9",
    "Bandicoot|133,132,112|858470",
    "Bali Hai|133,159,175|859FAF",
    "Half Baked|133,196,204|85C4CC",
    "Red Devil|134,1,17|860111",
    "Lotus|134,60,60|863C3C",
    "Ironstone|134,72,60|86483C",
    "Bull Shot|134,77,30|864D1E",
    "Rusty Nail|134,86,10|86560A",
    "Bitter|134,137,116|868974",
    "Regent Gray|134,148,159|86949F",
    "Disco|135,21,80|871550",
    "Americano|135,117,110|87756E",
    "Hurricane|135,124,123|877C7B",
    "Oslo Gray|135,141,145|878D91",
    "Sushi|135,171,57|87AB39",
    "Spicy Mix|136,83,66|885342",
    "Kumera|136,98,33|886221",
    "Suva Gray|136,131,135|888387",
    "Avocado|136,141,101|888D65",
    "Camelot|137,52,86|893456",
    "Solid Pink|137,56,67|893843",
    "Cannon Pink|137,67,103|894367",
    "Makara|137,125,109|897D6D",
    "Burnt Umber|138,51,36|8A3324",
    "True V|138,115,214|8A73D6",
    "Clay Creek|138,131,96|8A8360",
    "Monsoon|138,131,137|8A8389",
    "Stack|138,143,138|8A8F8A",
    "Jordy Blue|138,185,241|8AB9F1",
    "Electric Violet|139,0,255|8B00FF",
    "Monarch|139,7,35|8B0723",
    "Corn Harvest|139,107,11|8B6B0B",
    "Olive Haze|139,132,112|8B8470",
    "Schooner|139,132,126|8B847E",
    "Natural Gray|139,134,128|8B8680",
    "Mantle|139,156,144|8B9C90",
    "Portage|139,159,238|8B9FEE",
    "Envy|139,166,144|8BA690",
    "Cascade|139,169,165|8BA9A5",
    "Riptide|139,230,216|8BE6D8",
    "Cardinal Pink|140,5,94|8C055E",
    "Mule Fawn|140,71,47|8C472F",
    "Potters Clay|140,87,56|8C5738",
    "Trendy Pink|140,100,149|8C6495",
    "Paprika|141,2,38|8D0226",
    "Sanguine Brown|141,61,56|8D3D38",
    "Tosca|141,63,63|8D3F3F",
    "Cement|141,118,98|8D7662",
    "Granite Green|141,137,116|8D8974",
    "Manatee|141,144,161|8D90A1",
    "Polo Blue|141,168,204|8DA8CC",
    "Red Berry|142,0,0|8E0000",
    "Rope|142,77,30|8E4D1E",
    "Opium|142,111,112|8E6F70",
    "Domino|142,119,94|8E775E",
    "Mamba|142,129,144|8E8190",
    "Nepal|142,171,193|8EABC1",
    "Pohutukawa|143,2,28|8F021C",
    "El Salva|143,62,51|8F3E33",
    "Korma|143,75,14|8F4B0E",
    "Squirrel|143,129,118|8F8176",
    "Vista Blue|143,214,180|8FD6B4",
    "Burgundy|144,0,32|900020",
    "Old Brick|144,30,30|901E1E",
    "Hemp|144,120,116|907874",
    "Almond Frost|144,123,113|907B71",
    "Sycamore|144,141,57|908D39",
    "Sangria|146,0,10|92000A",
    "Cumin|146,67,33|924321",
    "Beaver|146,111,91|926F5B",
    "Stonewall|146,133,115|928573",
    "Venus|146,133,144|928590",
    "Medium Purple|147,112,219|9370DB",
    "Cornflower|147,204,234|93CCEA",
    "Algae Green|147,223,184|93DFB8",
    "Copper Rust|148,71,71|944747",
    "Arrowtown|148,119,113|948771",
    "Scarlett|149,0,21|950015",
    "Strikemaster|149,99,135|956387",
    "Mountain Mist|149,147,150|959396",
    "Carmine|150,0,24|960018",
    "Brown|150,75,0|964B00",
    "Leather|150,112,89|967059",
    "Purple Mountain's Majesty|150,120,182|9678B6",
    "Lavender Purple|150,123,182|967BB6",
    "Pewter|150,168,161|96A8A1",
    "Summer Green|150,187,171|96BBAB",
    "Au Chico|151,96,93|97605D",
    "Wisteria|151,113,181|9771B5",
    "Atlantis|151,205,45|97CD2D",
    "Vin Rouge|152,61,97|983D61",
    "Lilac Bush|152,116,211|9874D3",
    "Bazaar|152,119,123|98777B",
    "Hacienda|152,129,27|98811B",
    "Pale Oyster|152,141,119|988D77",
    "Mint Green|152,255,152|98FF98",
    "Fresh Eggplant|153,0,102|990066",
    "Violet Eggplant|153,17,153|991199",
    "Tamarillo|153,22,19|991613",
    "Totem Pole|153,27,7|991B07",
    "Copper Rose|153,102,102|996666",
    "Amethyst|153,102,204|9966CC",
    "Mountbatten Pink|153,122,141|997A8D",
    "Blue Bell|153,153,204|9999CC",
    "Prairie Sand|154,56,32|9A3820",
    "Toast|154,110,97|9A6E61",
    "Gurkha|154,149,119|9A9577",
    "Olivine|154,185,115|9AB973",
    "Shadow Green|154,194,184|9AC2B8",
    "Oregon|155,71,3|9B4703",
    "Lemon Grass|155,158,143|9B9E8F",
    "Stiletto|156,51,54|9C3336",
    "Hawaiian Tan|157,86,22|9D5616",
    "Gull Gray|157,172,183|9DACB7",
    "Pistachio|157,194,9|9DC209",
    "Granny Smith Apple|157,224,147|9DE093",
    "Anakiwa|157,229,255|9DE5FF",
    "Chelsea Gem|158,83,2|9E5302",
    "Sepia Skin|158,91,64|9E5B40",
    "Sage|158,165,135|9EA587",
    "Citron|158,169,31|9EA91F",
    "Rock Blue|158,177,205|9EB1CD",
    "Morning Glory|158,222,224|9EDEE0",
    "Cognac|159,56,29|9F381D",
    "Reef Gold|159,130,28|9F821C",
    "Star Dust|159,159,156|9F9F9C",
    "Santas Gray|159,160,177|9FA0B1",
    "Sinbad|159,215,211|9FD7D3",
    "Feijoa|159,221,140|9FDD8C",
    "Tabasco|160,39,18|A02712",
    "Buttered Rum|161,117,13|A1750D",
    "Hit Gray|161,173,181|A1ADB5",
    "Citrus|161,197,10|A1C50A",
    "Aqua Island|161,218,215|A1DAD7",
    "Water Leaf|161,233,222|A1E9DE",
    "Flirt|162,0,109|A2006D",
    "Rouge|162,59,108|A23B6C",
    "Cape Palliser|162,102,69|A26645",
    "Gray Chateau|162,170,179|A2AAB3",
    "Edward|162,174,171|A2AEAB",
    "Pharlap|163,128,123|A3807B",
    "Amethyst Smoke|163,151,180|A397B4",
    "Blizzard Blue|163,227,237|A3E3ED",
    "Delta|164,164,157|A4A49D",
    "Wistful|164,166,211|A4A6D3",
    "Green Smoke|164,175,110|A4AF6E",
    "Jazzberry Jam|165,11,94|A50B5E",
    "Zorba|165,155,145|A59B91",
    "Bahia|165,203,12|A5CB0C",
    "Roof Terracotta|166,47,32|A62F20",
    "Paarl|166,85,41|A65529",
    "Barley Corn|166,139,91|A68B5B",
    "Donkey Brown|166,146,121|A69279",
    "Dawn|166,162,154|A6A29A",
    "Mexican Red|167,37,37|A72525",
    "Luxor Gold|167,136,44|A7882C",
    "Rich Gold|168,83,7|A85307",
    "Reno Sand|168,101,21|A86515",
    "Coral Tree|168,107,107|A86B6B",
    "Dusty Gray|168,152,155|A8989B",
    "Dull Lavender|168,153,230|A899E6",
    "Tallow|168,165,137|A8A589",
    "Bud|168,174,156|A8AE9C",
    "Locust|168,175,142|A8AF8E",
    "Norway|168,189,159|A8BD9F",
    "Chinook|168,227,189|A8E3BD",
    "Gray Olive|169,164,145|A9A491",
    "Aluminium|169,172,182|A9ACB6",
    "Cadet Blue|169,178,195|A9B2C3",
    "Schist|169,180,151|A9B497",
    "Tower Gray|169,189,191|A9BDBF",
    "Perano|169,190,242|A9BEF2",
    "Opal|169,198,194|A9C6C2",
    "Night Shadz|170,55,90|AA375A",
    "Fire|170,66,3|AA4203",
    "Muesli|170,139,91|AA8B5B",
    "Sandal|170,141,111|AA8D6F",
    "Shady Lady|170,165,169|AAA5A9",
    "Logan|170,169,205|AAA9CD",
    "Spun Pearl|170,171,183|AAABB7",
    "Regent St Blue|170,214,230|AAD6E6",
    "Magic Mint|170,240,209|AAF0D1",
    "Lipstick|171,5,99|AB0563",
    "Royal Heath|171,52,114|AB3472",
    "Sandrift|171,145,122|AB917A",
    "Cold Purple|171,160,217|ABA0D9",
    "Bronco|171,161,150|ABA196",
    "Limed Oak|172,138,86|AC8A56",
    "East Side|172,145,206|AC91CE",
    "Lemon Ginger|172,158,34|AC9E22",
    "Napa|172,164,148|ACA494",
    "Hillary|172,165,134|ACA586",
    "Cloudy|172,165,159|ACA59F",
    "Silver Chalice|172,172,172|ACACAC",
    "Swamp Green|172,183,142|ACB78E",
    "Spring Rain|172,203,177|ACCBB1",
    "Conifer|172,221,77|ACDD4D",
    "Celadon|172,225,175|ACE1AF",
    "Mandalay|173,120,27|AD781B",
    "Casper|173,190,209|ADBED1",
    "Moss Green|173,223,173|ADDFAD",
    "Padua|173,230,196|ADE6C4",
    "Green Yellow|173,255,47|ADFF2F",
    "Hippie Pink|174,69,96|AE4560",
    "Desert|174,96,32|AE6020",
    "Bouquet|174,128,158|AE809E",
    "Medium Carmine|175,64,53|AF4035",
    "Apple Blossom|175,77,67|AF4D43",
    "Brown Rust|175,89,62|AF593E",
    "Driftwood|175,135,81|AF8751",
    "Alpine|175,143,44|AF8F2C",
    "Lucky|175,159,28|AF9F1C",
    "Martini|175,160,158|AFA09E",
    "Bombay|175,177,184|AFB1B8",
    "Pigeon Post|175,189,217|AFBDD9",
    "Cadillac|176,76,106|B04C6A",
    "Matrix|176,93,84|B05D54",
    "Tapestry|176,94,129|B05E81",
    "Mai Tai|176,102,8|B06608",
    "Del Rio|176,154,149|B09A95",
    "Powder Blue|176,224,230|B0E0E6",
    "Inch Worm|176,227,19|B0E313",
    "Bright Red|177,0,0|B10000",
    "Vesuvius|177,74,11|B14A0B",
    "Pumpkin Skin|177,97,11|B1610B",
    "Santa Fe|177,109,82|B16D52",
    "Teak|177,148,97|B19461",
    "Fringy Flower|177,226,193|B1E2C1",
    "Ice Cold|177,244,231|B1F4E7",
    "Shiraz|178,9,49|B20931",
    "Biloba Flower|178,161,234|B2A1EA",
    "Tall Poppy|179,45,41|B32D29",
    "Fiery Orange|179,82,19|B35213",
    "Hot Toddy|179,128,7|B38007",
    "Taupe Gray|179,175,149|B3AF95",
    "La Rioja|179,193,16|B3C110",
    "Well Read|180,51,50|B43332",
    "Blush|180,70,104|B44668",
    "Jungle Mist|180,207,211|B4CFD3",
    "Turkish Rose|181,114,129|B57281",
    "Lavender|181,126,220|B57EDC",
    "Mongoose|181,162,127|B5A27F",
    "Olive Green|181,179,92|B5B35C",
    "Jet Stream|181,210,206|B5D2CE",
    "Cruise|181,236,223|B5ECDF",
    "Hibiscus|182,49,108|B6316C",
    "Thatch|182,157,152|B69D98",
    "Heathered Gray|182,176,149|B6B095",
    "Eagle|182,186,164|B6BAA4",
    "Spindle|182,209,234|B6D1EA",
    "Gum Leaf|182,211,191|B6D3BF",
    "Rust|183,65,14|B7410E",
    "Muddy Waters|183,142,92|B78E5C",
    "Sahara|183,162,20|B7A214",
    "Husk|183,164,88|B7A458",
    "Nobel|183,177,177|B7B1B1",
    "Heather|183,195,208|B7C3D0",
    "Madang|183,240,190|B7F0BE",
    "Milano Red|184,17,4|B81104",
    "Copper|184,115,51|B87333",
    "Gimblet|184,181,106|B8B56A",
    "Green Spring|184,193,177|B8C1B1",
    "Celery|184,194,93|B8C25D",
    "Sail|184,224,249|B8E0F9",
    "Chestnut|185,78,72|B94E48",
    "Crail|185,81,64|B95140",
    "Marigold|185,141,40|B98D28",
    "Wild Willow|185,196,106|B9C46A",
    "Rainee|185,200,172|B9C8AC",
    "Guardsman Red|186,1,1|BA0101",
    "Rock Spray|186,69,12|BA450C",
    "Bourbon|186,111,30|BA6F1E",
    "Pirate Gold|186,127,3|BA7F03",
    "Nomad|186,177,162|BAB1A2",
    "Submarine|186,199,201|BAC7C9",
    "Medium Red Violet|187,51,133|BB3385",
    "Brandy Rose|187,137,131|BB8983",
    "Rio Grande|187,208,9|BBD009",
    "Surf|187,215,193|BBD7C1",
    "Powder Ash|188,201,194|BCC9C2",
    "Tuscany|189,94,46|BD5E2E",
    "Quicksand|189,151,142|BD978E",
    "Silk|189,177,168|BDB1A8",
    "Malta|189,178,161|BDB2A1",
    "Chatelle|189,179,199|BDB3C7",
    "Lavender Gray|189,189,215|BDBBD7",
    "French Gray|189,189,198|BDBDC6",
    "Clay Ash|189,200,179|BDC8B3",
    "Loblolly|189,201,206|BDC9CE",
    "French Pass|189,237,253|BDEDFD",
    "London Hue|190,166,195|BEA6C3",
    "Pink Swan|190,181,183|BEB5B7",
    "Fuego|190,222,13|BEDE0D",
    "Rose of Sharon|191,85,0|BF5500",
    "Tide|191,184,176|BFB8B0",
    "Blue Haze|191,190,216|BFBED8",
    "Silver Sand|191,193,194|BFC1C2",
    "Key Lime Pie|191,201,33|BFC921",
    "Ziggurat|191,219,226|BFDBE2",
    "Lime|191,255,0|BFFF00",
    "Thunderbird|192,43,24|C02B18",
    "Mojo|192,71,55|C04737",
    "Old Rose|192,128,129|C08081",
    "Silver|192,192,192|C0C0C0",
    "Pale Leaf|192,211,185|C0D3B9",
    "Pixie Green|192,216,182|C0D8B6",
    "Tia Maria|193,68,14|C1440E",
    "Fuchsia Pink|193,84,193|C154C1",
    "Buddha Gold|193,160,4|C1A004",
    "Bison Hide|193,183,164|C1B7A4",
    "Tea|193,186,176|C1BAB0",
    "Gray Suit|193,190,205|C1BECD",
    "Sprout|193,215,176|C1D7B0",
    "Sulu|193,240,124|C1F07C",
    "Indochine|194,107,3|C26B03",
    "Twine|194,149,93|C2955D",
    "Cotton Seed|194,189,182|C2BDB6",
    "Pumice|194,202,196|C2CAC4",
    "Jagged Ice|194,232,229|C2E8E5",
    "Maroon Flush|195,33,72|C32148",
    "Indian Khaki|195,176,145|C3B091",
    "Pale Slate|195,191,193|C3BFC1",
    "Gray Nickel|195,195,189|C3C3BD",
    "Periwinkle Gray|195,205,230|C3CDE6",
    "Tiara|195,209,209|C3D1D1",
    "Tropical Blue|195,221,249|C3DDF9",
    "Cardinal|196,30,58|C41E3A",
    "Fuzzy Wuzzy Brown|196,86,85|C45655",
    "Orange Roughy|196,87,25|C45719",
    "Mist Gray|196,196,188|C4C4BC",
    "Coriander|196,208,176|C4D0B0",
    "Mint Tulip|196,244,235|C4F4EB",
    "Mulberry|197,75,140|C54B8C",
    "Nugget|197,153,34|C59922",
    "Tussock|197,153,75|C5994B",
    "Sea Mist|197,219,202|C5DBCA",
    "Yellow Green|197,225,122|C5E17A",
    "Brick Red|198,45,66|C62D42",
    "Contessa|198,114,107|C6726B",
    "Oriental Pink|198,145,145|C69191",
    "Roti|198,168,75|C6A84B",
    "Ash|198,195,181|C6C3B5",
    "Kangaroo|198,200,189|C6C8BD",
    "Las Palmas|198,230,16|C6E610",
    "Monza|199,3,30|C7031E",
    "Red Violet|199,21,133|C71585",
    "Coral Reef|199,188,162|C7BCA2",
    "Melrose|199,193,255|C7C1FF",
    "Cloud|199,196,191|C7C4BF",
    "Ghost|199,201,213|C7C9D5",
    "Pine Glade|199,205,144|C7CD90",
    "Botticelli|199,221,229|C7DDE5",
    "Antique Brass|200,138,101|C88A65",
    "Lilac|200,162,200|C8A2C8",
    "Hokey Pokey|200,165,40|C8A528",
    "Lily|200,170,191|C8AABF",
    "Laser|200,181,104|C8B568",
    "Edgewater|200,227,215|C8E3D7",
    "Piper|201,99,35|C96323",
    "Pizza|201,148,21|C99415",
    "Light Wisteria|201,160,220|C9A0DC",
    "Rodeo Dust|201,178,155|C9B29B",
    "Sundance|201,179,91|C9B35B",
    "Earls Green|201,185,59|C9B93B",
    "Silver Rust|201,192,187|C9C0BB",
    "Conch|201,217,210|C9D9D2",
    "Reef|201,255,162|C9FFA2",
    "Aero Blue|201,255,229|C9FFE5",
    "Flush Mahogany|202,52,53|CA3435",
    "Turmeric|202,187,72|CABB48",
    "Paris White|202,220,212|CADCD4",
    "Bitter Lemon|202,224,13|CAE00D",
    "Skeptic|202,230,218|CAE6DA",
    "Viola|203,143,169|CB8FA9",
    "Foggy Gray|203,202,182|CBCAB6",
    "Green Mist|203,211,176|CBD3B0",
    "Nebula|203,219,214|CBDBD6",
    "Persian Red|204,51,51|CC3333",
    "Burnt Orange|204,85,0|CC5500",
    "Ochre|204,119,34|CC7722",
    "Puce|204,136,153|CC8899",
    "Thistle Green|204,202,168|CCCAA8",
    "Periwinkle|204,204,255|CCCCFF",
    "Electric Lime|204,255,0|CCFF00",
    "Tenn|205,87,0|CD5700",
    "Chestnut Rose|205,92,92|CD5C5C",
    "Brandy Punch|205,132,41|CD8429",
    "Onahau|205,244,255|CDF4FF",
    "Sorrell Brown|206,185,143|CEB98F",
    "Cold Turkey|206,186,186|CEBABA",
    "Yuma|206,194,145|CEC291",
    "Chino|206,199,167|CEC7A7",
    "Eunry|207,163,157|CFA39D",
    "Old Gold|207,181,59|CFB53B",
    "Tasman|207,220,207|CFDCCF",
    "Surf Crest|207,229,210|CFE5D2",
    "Humming Bird|207,249,243|CFF9F3",
    "Scandal|207,250,244|CFFAF4",
    "Red Stage|208,95,4|D05F04",
    "Hopbush|208,109,161|D06DA1",
    "Meteor|208,125,18|D07D12",
    "Perfume|208,190,248|D0BEF8",
    "Prelude|208,192,229|D0C0E5",
    "Tea Green|208,240,192|D0F0C0",
    "Geebung|209,143,27|D18F1B",
    "Vanilla|209,190,168|D1BEA8",
    "Soft Amber|209,198,180|D1C6B4",
    "Celeste|209,210,202|D1D2CA",
    "Mischka|209,210,221|D1D2DD",
    "Pear|209,226,49|D1E231",
    "Hot Cinnamon|210,105,30|D2691E",
    "Raw Sienna|210,125,70|D27D46",
    "Careys Pink|210,158,170|D29EAA",
    "Tan|210,180,140|D2B48C",
    "Deco|210,218,151|D2DA97",
    "Blue Romance|210,246,222|D2F6DE",
    "Gossip|210,248,176|D2F8B0",
    "Sisal|211,203,186|D3CBBA",
    "Swirl|211,205,197|D3CDC5",
    "Charm|212,116,148|D47494",
    "Clam Shell|212,182,175|D4B6AF",
    "Straw|212,191,141|D4BF8D",
    "Akaroa|212,196,168|D4C4A8",
    "Bird Flower|212,205,22|D4CD16",
    "Iron|212,215,217|D4D7D9",
    "Geyser|212,223,226|D4DFE2",
    "Hawkes Blue|212,226,252|D4E2FC",
    "Grenadier|213,70,0|D54600",
    "Can Can|213,145,164|D591A4",
    "Whiskey|213,154,111|D59A6F",
    "Winter Hazel|213,209,149|D5D195",
    "Granny Apple|213,246,227|D5F6E3",
    "My Pink|214,145,136|D69188",
    "Tacha|214,197,98|D6C562",
    "Moon Raker|214,206,246|D6CEF6",
    "Quill Gray|214,214,209|D6D6D1",
    "Snowy Mint|214,255,219|D6FFDB",
    "New York Pink|215,131,127|D7837F",
    "Pavlova|215,196,152|D7C498",
    "Fog|215,208,255|D7D0FF",
    "Valencia|216,68,55|D84437",
    "Japonica|216,124,99|D87C63",
    "Thistle|216,191,216|D8BFD8",
    "Maverick|216,194,213|D8C2D5",
    "Foam|216,252,250|D8FCFA",
    "Cabaret|217,73,114|D94972",
    "Burning Sand|217,147,118|D99376",
    "Cameo|217,185,155|D9B99B",
    "Timberwolf|217,214,207|D9D6CF",
    "Tana|217,220,193|D9DCC1",
    "Link Water|217,228,245|D9E4F5",
    "Mabel|217,247,255|D9F7FF",
    "Cerise|218,50,135|DA3287",
    "Flame Pea|218,91,56|DA5B38",
    "Bamboo|218,99,4|DA6304",
    "Red Damask|218,106,65|DA6A41",
    "Orchid|218,112,214|DA70D6",
    "Copperfield|218,138,103|DA8A67",
    "Golden Grass|218,165,32|DAA520",
    "Zanah|218,236,214|DAECD6",
    "Iceberg|218,244,240|DAF4F0",
    "Oyster Bay|218,250,255|DAFAFF",
    "Cranberry|219,80,121|DB5079",
    "Petite Orchid|219,150,144|DB9690",
    "Di Serria|219,153,94|DB995E",
    "Alto|219,219,219|DBDBDB",
    "Frosted Mint|219,255,248|DBFFF8",
    "Crimson|220,20,60|DC143C",
    "Punch|220,67,51|DC4333",
    "Galliano|220,178,12|DCB20C",
    "Blossom|220,180,188|DCB4BC",
    "Wattle|220,215,71|DCD747",
    "Westar|220,217,210|DCD9D2",
    "Moon Mist|220,221,204|DCDDCC",
    "Caper|220,237,180|DCEDB4",
    "Swans Down|220,240,234|DCF0EA",
    "Swiss Coffee|221,214,213|DDD6D5",
    "White Ice|221,249,241|DDF9F1",
    "Cerise Red|222,49,99|DE3163",
    "Roman|222,99,96|DE6360",
    "Tumbleweed|222,166,129|DEA681",
    "Gold Tips|222,186,19|DEBA13",
    "Brandy|222,193,150|DEC196",
    "Wafer|222,203,198|DECBC6",
    "Sapling|222,212,164|DED4A4",
    "Barberry|222,215,23|DED717",
    "Beryl Green|222,229,192|DEE5C0",
    "Pattens Blue|222,245,255|DEF5FF",
    "Heliotrope|223,115,255|DF73FF",
    "Apache|223,190,111|DFBE6F",
    "Chenin|223,205,111|DFCD6F",
    "Lola|223,207,219|DFCFDB",
    "Willow Brook|223,236,218|DFECDA",
    "Chartreuse Yellow|223,255,0|DFFF00",
    "Mauve|224,176,255|E0B0FF",
    "Anzac|224,182,70|E0B646",
    "Harvest Gold|224,185,116|E0B974",
    "Calico|224,192,149|E0C095",
    "Baby Blue|224,255,255|E0FFFF",
    "Sunglo|225,104,101|E16865",
    "Equator|225,188,100|E1BC64",
    "Pink Flare|225,192,200|E1C0C8",
    "Periglacial Blue|225,230,214|E1E6D6",
    "Kidnapper|225,234,212|E1EAD4",
    "Tara|225,246,232|E1F6E8",
    "Mandy|226,84,101|E25465",
    "Terracotta|226,114,91|E2725B",
    "Golden Bell|226,137,19|E28913",
    "Shocking|226,146,192|E292C0",
    "Dixie|226,148,24|E29418",
    "Light Orchid|226,156,210|E29CD2",
    "Snuff|226,216,237|E2D8ED",
    "Mystic|226,235,237|E2EBED",
    "Apple Green|226,243,236|E2F3EC",
    "Razzmatazz|227,11,92|E30B5C",
    "Alizarin Crimson|227,38,54|E32636",
    "Cinnabar|227,66,52|E34234",
    "Cavern Pink|227,190,190|E3BEBE",
    "Peppermint|227,245,225|E3F5E1",
    "Mindaro|227,249,136|E3F988",
    "Deep Blush|228,118,152|E47698",
    "Gamboge|228,155,15|E49B0F",
    "Melanie|228,194,213|E4C2D5",
    "Twilight|228,207,222|E4CFDE",
    "Bone|228,209,192|E4D1C0",
    "Sunflower|228,212,34|E4D422",
    "Grain Brown|228,213,183|E4D5B7",
    "Zombie|228,214,155|E4D69B",
    "Frostee|228,246,231|E4F6E7",
    "Snow Flurry|228,255,209|E4FFD1",
    "Amaranth|229,43,80|E52B50",
    "Zest|229,132,27|E5841B",
    "Dust Storm|229,204,201|E5CCC9",
    "Stark White|229,215,189|E5D7BD",
    "Hampton|229,216,175|E5D8AF",
    "Bon Jour|229,224,225|E5E0E1",
    "Mercury|229,229,229|E5E5E5",
    "Polar|229,249,246|E5F9F6",
    "Trinidad|230,78,3|E64E03",
    "Gold Sand|230,190,138|E6BE8A",
    "Cashmere|230,190,165|E6BEA5",
    "Double Spanish White|230,215,185|E6D7B9",
    "Satin Linen|230,228,212|E6E4D4",
    "Harp|230,242,234|E6F2EA",
    "Off Green|230,248,243|E6F8F3",
    "Hint of Green|230,255,233|E6FFE9",
    "Tranquil|230,255,255|E6FFFF",
    "Mango Tango|231,114,0|E77200",
    "Christine|231,115,10|E7730A",
    "Tonys Pink|231,159,140|E79F8C",
    "Kobi|231,159,196|E79FC4",
    "Rose Fog|231,188,180|E7BCB4",
    "Corn|231,191,5|E7BF05",
    "Putty|231,205,140|E7CD8C",
    "Gray Nurse|231,236,230|E7ECE6",
    "Lily White|231,248,255|E7F8FF",
    "Bubbles|231,254,255|E7FEFF",
    "Fire Bush|232,153,40|E89928",
    "Shilo|232,185,179|E8B9B3",
    "Pearl Bush|232,224,213|E8E0D5",
    "Green White|232,235,224|E8EBE0",
    "Chrome White|232,241,212|E8F1D4",
    "Gin|232,242,235|E8F2EB",
    "Aqua Squeeze|232,245,242|E8F5F2",
    "Clementine|233,110,0|E96E00",
    "Burnt Sienna|233,116,81|E97451",
    "Tahiti Gold|233,124,7|E97C07",
    "Oyster Pink|233,206,205|E9CECD",
    "Confetti|233,215,90|E9D75A",
    "Ebb|233,227,227|E9E3E3",
    "Ottoman|233,248,237|E9F8ED",
    "Clear Day|233,255,253|E9FFFD",
    "Carissma|234,136,168|EA88A8",
    "Porsche|234,174,105|EAAE69",
    "Tulip Tree|234,179,59|EAB33B",
    "Rob Roy|234,198,116|EAC674",
    "Raffia|234,218,184|EADAB8",
    "White Rock|234,232,212|EAE8D4",
    "Panache|234,246,238|EAF6EE",
    "Solitude|234,246,255|EAF6FF",
    "Aqua Spring|234,249,245|EAF9F5",
    "Dew|234,255,254|EAFFFE",
    "Apricot|235,147,115|EB9373",
    "Zinnwaldite|235,194,175|EBC2AF",
    "Fuel Yellow|236,169,39|ECA927",
    "Ronchi|236,197,78|ECC54E",
    "French Lilac|236,199,238|ECC7EE",
    "Just Right|236,205,185|ECCDB9",
    "Wild Rice|236,224,144|ECE090",
    "Fall Green|236,235,189|ECEBBD",
    "Aths Special|236,235,206|ECEBCE",
    "Starship|236,242,69|ECF245",
    "Red Ribbon|237,10,63|ED0A3F",
    "Tango|237,122,28|ED7A1C",
    "Carrot Orange|237,145,33|ED9121",
    "Sea Pink|237,152,158|ED989E",
    "Tacao|237,179,129|EDB381",
    "Desert Sand|237,201,175|EDC9AF",
    "Pancho|237,205,171|EDCDAB",
    "Chamois|237,220,177|EDDCB1",
    "Primrose|237,234,153|EDEA99",
    "Frost|237,245,221|EDF5DD",
    "Aqua Haze|237,245,245|EDF5F5",
    "Zumthor|237,246,255|EDF6FF",
    "Narvik|237,249,241|EDF9F1",
    "Honeysuckle|237,252,132|EDFC84",
    "Lavender Magenta|238,130,238|EE82EE",
    "Beauty Bush|238,193,190|EEC1BE",
    "Chalky|238,215,148|EED794",
    "Almond|238,217,196|EED9C4",
    "Flax|238,220,130|EEDC82",
    "Bizarre|238,222,218|EEDEDA",
    "Double Colonial White|238,227,173|EEE3AD",
    "Cararra|238,238,232|EEEEE8",
    "Manz|238,239,120|EEEF78",
    "Tahuna Sands|238,240,200|EEF0C8",
    "Athens Gray|238,240,243|EEF0F3",
    "Tusk|238,243,195|EEF3C3",
    "Loafer|238,244,222|EEF4DE",
    "Catskill White|238,246,247|EEF6F7",
    "Twilight Blue|238,253,255|EEFDFF",
    "Jonquil|238,255,154|EEFF9A",
    "Rice Flower|238,255,226|EEFFE2",
    "Jaffa|239,134,63|EF863F",
    "Gallery|239,239,239|EFEFEF",
    "Porcelain|239,242,243|EFF2F3",
    "Mauvelous|240,145,169|F091A9",
    "Golden Dream|240,213,45|F0D52D",
    "Golden Sand|240,219,125|F0DB7D",
    "Buff|240,220,130|F0DC82",
    "Prim|240,226,236|F0E2EC",
    "Khaki|240,230,140|F0E68C",
    "Selago|240,238,253|F0EEFD",
    "Titan White|240,238,255|F0EEFF",
    "Alice Blue|240,248,255|F0F8FF",
    "Feta|240,252,234|F0FCEA",
    "Gold Drop|241,130,0|F18200",
    "Wewak|241,155,171|F19BAB",
    "Sahara Sand|241,231,136|F1E788",
    "Parchment|241,233,210|F1E9D2",
    "Blue Chalk|241,233,255|F1E9FF",
    "Mint Julep|241,238,193|F1EEC1",
    "Seashell|241,241,241|F1F1F1",
    "Saltpan|241,247,242|F1F7F2",
    "Tidal|241,255,173|F1FFAD",
    "Chiffon|241,255,200|F1FFC8",
    "Flamingo|242,85,42|F2552A",
    "Tangerine|242,133,0|F28500",
    "Mandys Pink|242,195,178|F2C3B2",
    "Concrete|242,242,242|F2F2F2",
    "Black Squeeze|242,250,250|F2FAFA",
    "Pomegranate|243,71,35|F34723",
    "Buttercup|243,173,22|F3AD16",
    "New Orleans|243,214,157|F3D69D",
    "Vanilla Ice|243,217,223|F3D9DF",
    "Sidecar|243,231,187|F3E7BB",
    "Dawn Pink|243,233,229|F3E9E5",
    "Wheatfield|243,237,207|F3EDCF",
    "Canary|243,251,98|F3FB62",
    "Orinoco|243,251,212|F3FBD4",
    "Carla|243,255,216|F3FFD8",
    "Hollywood Cerise|244,0,161|F400A1",
    "Sandy brown|244,164,96|F4A460",
    "Saffron|244,196,48|F4C430",
    "Ripe Lemon|244,216,28|F4D81C",
    "Janna|244,235,211|F4EBD3",
    "Pampas|244,242,238|F4F2EE",
    "Wild Sand|244,244,244|F4F4F4",
    "Zircon|244,248,255|F4F8FF",
    "Froly|245,117,132|F57584",
    "Cream Can|245,200,92|F5C85C",
    "Manhattan|245,201,153|F5C999",
    "Maize|245,213,160|F5D5A0",
    "Wheat|245,222,179|F5DEB3",
    "Sandwisp|245,231,162|F5E7A2",
    "Pot Pourri|245,231,226|F5E7E2",
    "Albescent White|245,233,211|F5E9D3",
    "Soft Peach|245,237,239|F5EDEF",
    "Ecru White|245,243,229|F5F3E5",
    "Beige|245,245,220|F5F5DC",
    "Golden Fizz|245,251,61|F5FB3D",
    "Australian Mint|245,255,190|F5FFBE",
    "French Rose|246,74,138|F64A8A",
    "Brilliant Rose|246,83,166|F653A6",
    "Illusion|246,164,201|F6A4C9",
    "Merino|246,240,230|F6F0E6",
    "Black Haze|246,247,247|F6F7F7",
    "Spring Sun|246,255,220|F6FFDC",
    "Violet Red|247,70,138|F7468A",
    "Chilean Fire|247,119,3|F77703",
    "Persian Pink|247,127,190|F77FBE",
    "Rajah|247,182,104|F7B668",
    "Azalea|247,200,218|F7C8DA",
    "We Peep|247,219,230|F7DBE6",
    "Quarter Spanish White|247,242,225|F7F2E1",
    "Whisper|247,245,250|F7F5FA",
    "Snow Drift|247,250,247|F7FAF7",
    "Casablanca|248,184,83|F8B853",
    "Chantilly|248,195,223|F8C3DF",
    "Cherub|248,217,233|F8D9E9",
    "Marzipan|248,219,157|F8DB9D",
    "Energy Yellow|248,221,92|F8DD5C",
    "Givry|248,228,191|F8E4BF",
    "White Linen|248,240,232|F8F0E8",
    "Magnolia|248,244,255|F8F4FF",
    "Spring Wood|248,246,241|F8F6F1",
    "Coconut Cream|248,247,220|F8F7DC",
    "White Lilac|248,247,252|F8F7FC",
    "Desert Storm|248,248,247|F8F8F7",
    "Texas|248,249,156|F8F99C",
    "Corn Field|248,250,205|F8FACD",
    "Mimosa|248,253,211|F8FDD3",
    "Carnation|249,90,97|F95A61",
    "Saffron Mango|249,191,88|F9BF58",
    "Carousel Pink|249,224,237|F9E0ED",
    "Dairy Cream|249,228,188|F9E4BC",
    "Portica|249,230,99|F9E663",
    "Amour|249,234,243|F9EAF3",
    "Rum Swizzle|249,248,228|F9F8E4",
    "Dolly|249,255,139|F9FF8B",
    "Sugar Cane|249,255,246|F9FFF6",
    "Ecstasy|250,120,20|FA7814",
    "Tan Hide|250,157,90|FA9D5A",
    "Corvette|250,211,162|FAD3A2",
    "Peach Yellow|250,223,173|FADFAD",
    "Turbo|250,230,0|FAE600",
    "Astra|250,234,185|FAEAB9",
    "Champagne|250,236,204|FAECCC",
    "Linen|250,240,230|FAF0E6",
    "Fantasy|250,243,240|FAF3F0",
    "Citrine White|250,247,214|FAF7D6",
    "Alabaster|250,250,250|FAFAFA",
    "Hint of Yellow|250,253,228|FAFDE4",
    "Milan|250,255,164|FAFFA4",
    "Brink Pink|251,96,127|FB607F",
    "Geraldine|251,137,137|FB8989",
    "Lavender Rose|251,160,227|FBA0E3",
    "Sea Buckthorn|251,161,41|FBA129",
    "Sun|251,172,19|FBAC13",
    "Lavender Pink|251,174,210|FBAED2",
    "Rose Bud|251,178,163|FBB2A3",
    "Cupid|251,190,218|FBBEDA",
    "Classic Rose|251,204,231|FBCCE7",
    "Apricot Peach|251,206,177|FBCEB1",
    "Banana Mania|251,231,178|FBE7B2",
    "Marigold Yellow|251,232,112|FBE870",
    "Festival|251,233,108|FBE96C",
    "Sweet Corn|251,234,140|FBEA8C",
    "Candy Corn|251,236,93|FBEC5D",
    "Hint of Red|251,249,249|FBF9F9",
    "Shalimar|251,255,186|FBFFBA",
    "Shocking Pink|252,15,192|FC0FC0",
    "Tickle Me Pink|252,128,165|FC80A5",
    "Tree Poppy|252,156,29|FC9C1D",
    "Lightning Yellow|252,192,30|FCC01E",
    "Goldenrod|252,214,103|FCD667",
    "Candlelight|252,217,23|FCD917",
    "Cherokee|252,218,152|FCDA98",
    "Double Pearl Lusta|252,244,208|FCF4D0",
    "Pearl Lusta|252,244,220|FCF4DC",
    "Vista White|252,248,247|FCF8F7",
    "Bianca|252,251,243|FCFBF3",
    "Moon Glow|252,254,218|FCFEDA",
    "China Ivory|252,255,231|FCFFE7",
    "Ceramic|252,255,249|FCFFF9",
    "Torch Red|253,14,53|FD0E35",
    "Wild Watermelon|253,91,120|FD5B78",
    "Crusta|253,123,51|FD7B33",
    "Sorbus|253,124,7|FD7C07",
    "Sweet Pink|253,159,162|FD9FA2",
    "Light Apricot|253,213,177|FDD5B1",
    "Pig Pink|253,215,228|FDD7E4",
    "Cinderella|253,225,220|FDE1DC",
    "Golden Glow|253,226,149|FDE295",
    "Lemon|253,233,16|FDE910",
    "Old Lace|253,245,230|FDF5E6",
    "Half Colonial White|253,246,211|FDF6D3",
    "Drover|253,247,173|FDF7AD",
    "Pale Prim|253,254,184|FDFEB8",
    "Cumulus|253,255,213|FDFFD5",
    "Persian Rose|254,40,162|FE28A2",
    "Sunset Orange|254,76,64|FE4C40",
    "Bittersweet|254,111,94|FE6F5E",
    "California|254,157,4|FE9D04",
    "Yellow Sea|254,169,4|FEA904",
    "Melon|254,186,173|FEBAAD",
    "Bright Sun|254,211,60|FED33C",
    "Dandelion|254,216,93|FED85D",
    "Salomie|254,219,141|FEDB8D",
    "Cape Honey|254,229,172|FEE5AC",
    "Remy|254,235,243|FEEBF3",
    "Oasis|254,239,206|FEEFCE",
    "Bridesmaid|254,240,236|FEF0EC",
    "Beeswax|254,242,199|FEF2C7",
    "Bleach White|254,243,216|FEF3D8",
    "Pipi|254,244,204|FEF4CC",
    "Half Spanish White|254,244,219|FEF4DB",
    "Wisp Pink|254,244,248|FEF4F8",
    "Provincial Pink|254,245,241|FEF5F1",
    "Half Dutch White|254,247,222|FEF7DE",
    "Solitaire|254,248,226|FEF8E2",
    "White Pointer|254,248,255|FEF8FF",
    "Off Yellow|254,249,227|FEF9E3",
    "Orange White|254,252,237|FEFCED",
    "Red|255,0,0|FF0000",
    "Rose|255,0,127|FF007F",
    "Purple Pizzazz|255,0,204|FF00CC",
    "Magenta / Fuchsia|255,0,255|FF00FF",
    "Scarlet|255,36,0|FF2400",
    "Wild Strawberry|255,51,153|FF3399",
    "Razzle Dazzle Rose|255,51,204|FF33CC",
    "Radical Red|255,53,94|FF355E",
    "Red Orange|255,63,52|FF3F34",
    "Coral Red|255,64,64|FF4040",
    "Vermilion|255,77,0|FF4D00",
    "International Orange|255,79,0|FF4F00",
    "Outrageous Orange|255,96,55|FF6037",
    "Blaze Orange|255,102,0|FF6600",
    "Pink Flamingo|255,102,255|FF66FF",
    "Orange|255,104,31|FF681F",
    "Hot Pink|255,105,180|FF69B4",
    "Persimmon|255,107,83|FF6B53",
    "Blush Pink|255,111,255|FF6FFF",
    "Burning Orange|255,112,52|FF7034",
    "Pumpkin|255,117,24|FF7518",
    "Flamenco|255,125,7|FF7D07",
    "Flush Orange|255,127,0|FF7F00",
    "Coral|255,127,80|FF7F50",
    "Salmon|255,140,105|FF8C69",
    "Pizazz|255,144,0|FF9000",
    "West Side|255,145,15|FF910F",
    "Pink Salmon|255,145,164|FF91A4",
    "Neon Carrot|255,153,51|FF9933",
    "Atomic Tangerine|255,153,102|FF9966",
    "Vivid Tangerine|255,152,128|FF9980",
    "Sunshade|255,158,44|FF9E2C",
    "Orange Peel|255,160,0|FFA000",
    "Mona Lisa|255,161,148|FFA194",
    "Web Orange|255,165,0|FFA500",
    "Carnation Pink|255,166,201|FFA6C9",
    "Hit Pink|255,171,129|FFAB81",
    "Yellow Orange|255,174,66|FFAE42",
    "Cornflower Lilac|255,176,172|FFB0AC",
    "Sundown|255,177,179|FFB1B3",
    "My Sin|255,179,31|FFB31F",
    "Texas Rose|255,181,85|FFB555",
    "Cotton Candy|255,183,213|FFB7D5",
    "Macaroni and Cheese|255,185,123|FFB97B",
    "Selective Yellow|255,186,0|FFBA00",
    "Koromiko|255,189,95|FFBD5F",
    "Amber|255,191,0|FFBF00",
    "Wax Flower|255,192,168|FFC0A8",
    "Pink|255,192,203|FFC0CB",
    "Your Pink|255,195,192|FFC3C0",
    "Supernova|255,201,1|FFC901",
    "Flesh|255,203,164|FFCBA4",
    "Sunglow|255,204,51|FFCC33",
    "Golden Tainoi|255,204,92|FFCC5C",
    "Peach Orange|255,204,153|FFCC99",
    "Chardonnay|255,205,140|FFCD8C",
    "Pastel Pink|255,209,220|FFD1DC",
    "Romantic|255,210,183|FFD2B7",
    "Grandis|255,211,140|FFD38C",
    "Gold|255,215,0|FFD700",
    "School bus Yellow|255,216,0|FFD800",
    "Cosmos|255,216,217|FFD8D9",
    "Mustard|255,219,88|FFDB58",
    "Peach Schnapps|255,220,214|FFDCD6",
    "Caramel|255,221,175|FFDDAF",
    "Tuft Bush|255,221,205|FFDDCD",
    "Watusi|255,221,207|FFDDCF",
    "Pink Lace|255,221,244|FFDDF4",
    "Navajo White|255,222,173|FFDEAD",
    "Frangipani|255,222,179|FFDEB3",
    "Pippin|255,225,223|FFE1DF",
    "Pale Rose|255,225,242|FFE1F2",
    "Negroni|255,226,197|FFE2C5",
    "Cream Brulee|255,229,160|FFE5A0",
    "Peach|255,229,180|FFE5B4",
    "Tequila|255,230,199|FFE6C7",
    "Kournikova|255,231,114|FFE772",
    "Sandy Beach|255,234,200|FFEAC8",
    "Karry|255,234,212|FFEAD4",
    "Broom|255,236,19|FFEC13",
    "Colonial White|255,237,188|FFEDBC",
    "Derby|255,238,216|FFEED8",
    "Vis Vis|255,239,161|FFEFA1",
    "Egg White|255,239,193|FFEFC1",
    "Papaya Whip|255,239,213|FFEFD5",
    "Fair Pink|255,239,236|FFEFEC",
    "Peach Cream|255,240,219|FFF0DB",
    "Lavender blush|255,240,245|FFF0F5",
    "Gorse|255,241,79|FFF14F",
    "Buttermilk|255,241,181|FFF1B5",
    "Pink Lady|255,241,216|FFF1D8",
    "Forget Me Not|255,241,238|FFF1EE",
    "Tutu|255,241,249|FFF1F9",
    "Picasso|255,243,157|FFF39D",
    "Chardon|255,243,241|FFF3F1",
    "Paris Daisy|255,244,110|FFF46E",
    "Barley White|255,244,206|FFF4CE",
    "Egg Sour|255,244,221|FFF4DD",
    "Sazerac|255,244,224|FFF4E0",
    "Serenade|255,244,232|FFF4E8",
    "Chablis|255,244,243|FFF4F3",
    "Seashell Peach|255,245,238|FFF5EE",
    "Sauvignon|255,245,243|FFF5F3",
    "Milk Punch|255,246,212|FFF6D4",
    "Varden|255,246,223|FFF6DF",
    "Rose White|255,246,245|FFF6F5",
    "Baja White|255,248,209|FFF8D1",
    "Gin Fizz|255,249,226|FFF9E2",
    "Early Dawn|255,249,230|FFF9E6",
    "Lemon Chiffon|255,250,205|FFFACD",
    "Bridal Heath|255,250,244|FFFAF4",
    "Scotch Mist|255,251,220|FFFBDC",
    "Soapstone|255,251,249|FFFBF9",
    "Witch Haze|255,252,153|FFFC99",
    "Buttery White|255,252,234|FFFCEA",
    "Island Spice|255,252,238|FFFCEE",
    "Cream|255,253,208|FFFDD0",
    "Chilean Heath|255,253,230|FFFDE6",
    "Travertine|255,253,232|FFFDE8",
    "Orchid White|255,253,243|FFFDF3",
    "Quarter Pearl Lusta|255,253,244|FFFDF4",
    "Half and Half|255,254,225|FFFEE1",
    "Apricot White|255,254,236|FFFEEC",
    "Rice Cake|255,254,240|FFFEF0",
    "Black White|255,254,246|FFFEF6",
    "Romance|255,254,253|FFFEFD",
    "Yellow|255,255,0|FFFF00",
    "Laser Lemon|255,255,102|FFFF66",
    "Pale Canary|255,255,153|FFFF99",
    "Portafino|255,255,180|FFFFB4",
    "Ivory|255,255,240|FFFFF0",
    "White|255,255,255|FFFFFF"
    ].join("\n");

    function trimString(s) {
        return (s || "").replace(/^\s+|\s+$/g, "");
    }

    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    function safeInt(v, fallback) {
        var n = parseInt(v, 10);
        return isNaN(n) ? fallback : n;
    }

    function pad2Hex(n) {
        var s = clamp(Math.round(n), 0, 255).toString(16).toUpperCase();
        return s.length === 1 ? "0" + s : s;
    }

    function rgbToHex(r, g, b) {
        return pad2Hex(r) + pad2Hex(g) + pad2Hex(b);
    }

    function rgbToCMYK(r, g, b) {
        var rn = clamp(r, 0, 255) / 255;
        var gn = clamp(g, 0, 255) / 255;
        var bn = clamp(b, 0, 255) / 255;
        var k = 1 - Math.max(rn, gn, bn);
        var c, m, y;

        if (k >= 1) {
            return { c: 0, m: 0, y: 0, k: 100 };
        }

        c = (1 - rn - k) / (1 - k);
        m = (1 - gn - k) / (1 - k);
        y = (1 - bn - k) / (1 - k);

        return {
            c: clamp(Math.round(c * 100), 0, 100),
            m: clamp(Math.round(m * 100), 0, 100),
            y: clamp(Math.round(y * 100), 0, 100),
            k: clamp(Math.round(k * 100), 0, 100)
        };
    }

    function normalizeHex(hex) {
        hex = trimString(hex).replace(/^#/, "").toUpperCase();
        if (hex.length === 3) {
            return hex.charAt(0) + hex.charAt(0) +
                   hex.charAt(1) + hex.charAt(1) +
                   hex.charAt(2) + hex.charAt(2);
        }
        if (hex.length !== 6) return "";
        return hex;
    }

    function rgbDistanceSq(a, b) {
        var dr = a.r - b.r;
        var dg = a.g - b.g;
        var db = a.b - b.b;
        return dr * dr + dg * dg + db * db;
    }

    function relativeLuminance(rgb) {
        return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
    }

    function chooseTextRGB(bg) {
        return relativeLuminance(bg) >= 155
            ? { r: 20, g: 20, b: 20 }
            : { r: 245, g: 245, b: 245 };
    }

    function makeRGBColor(r, g, b) {
        var c = new RGBColor();
        c.red = clamp(Math.round(r), 0, 255);
        c.green = clamp(Math.round(g), 0, 255);
        c.blue = clamp(Math.round(b), 0, 255);
        return c;
    }

    function copyRGB(rgb) {
        return { r: rgb.r, g: rgb.g, b: rgb.b };
    }

    function getIllustratorRGBFromAnyColor(color) {
        if (!color) return null;

        try {
            switch (color.typename) {
                case "RGBColor":
                    return {
                        r: clamp(Math.round(color.red), 0, 255),
                        g: clamp(Math.round(color.green), 0, 255),
                        b: clamp(Math.round(color.blue), 0, 255)
                    };

                case "GrayColor":
                    var gv = clamp(Math.round((color.gray / 100) * 255), 0, 255);
                    return { r: gv, g: gv, b: gv };

                case "CMYKColor":
                    var c = color.cyan / 100;
                    var m = color.magenta / 100;
                    var y = color.yellow / 100;
                    var k = color.black / 100;
                    return {
                        r: clamp(Math.round(255 * (1 - c) * (1 - k)), 0, 255),
                        g: clamp(Math.round(255 * (1 - m) * (1 - k)), 0, 255),
                        b: clamp(Math.round(255 * (1 - y) * (1 - k)), 0, 255)
                    };

                case "SpotColor":
                    return getIllustratorRGBFromAnyColor(color.spot.color);

                default:
                    return null;
            }
        } catch (e) {
            return null;
        }
    }

    function resolveSafeFontByName(name) {
        var i, tf;
        name = trimString(name);

        if (name) {
            try {
                for (i = 0; i < app.textFonts.length; i++) {
                    tf = app.textFonts[i];
                    if (tf.name === name || tf.family === name || tf.style === name || tf.postScriptName === name) {
                        return tf;
                    }
                }
            } catch (e1) {}
        }

        for (i = 0; i < DEFAULT_FONT_FALLBACKS.length; i++) {
            try {
                tf = app.textFonts.getByName(DEFAULT_FONT_FALLBACKS[i]);
                if (tf) return tf;
            } catch (e2) {}
        }

        try {
            if (app.textFonts.length > 0) return app.textFonts[0];
        } catch (e3) {}

        return null;
    }

    function parseColorWorldData(raw) {
        var lines = raw.split(/\r?\n/);
        var arr = [];
        var i, line, parts, name, rgbParts, hex, r, g, b;

        for (i = 0; i < lines.length; i++) {
            line = trimString(lines[i]);
            if (!line || line.charAt(0) === "#") continue;

            parts = line.split("|");
            if (parts.length < 3) continue;

            name = trimString(parts[0]);
            rgbParts = trimString(parts[1]).split(",");
            hex = normalizeHex(parts[2]);

            if (rgbParts.length !== 3 || !name || !hex) continue;

            r = safeInt(rgbParts[0], -1);
            g = safeInt(rgbParts[1], -1);
            b = safeInt(rgbParts[2], -1);

            if (r < 0 || g < 0 || b < 0) continue;

            arr.push({
                name: name,
                r: clamp(r, 0, 255),
                g: clamp(g, 0, 255),
                b: clamp(b, 0, 255),
                hex: hex
            });
        }

        return arr;
    }

    function matchColorName(rgb, dataset) {
        var hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        var i, item, d, best = null, bestD = Number.MAX_VALUE;

        for (i = 0; i < dataset.length; i++) {
            item = dataset[i];
            if (item.r === rgb.r && item.g === rgb.g && item.b === rgb.b) {
                return {
                    name: item.name,
                    hex: hex,
                    matchedBy: "exact-rgb"
                };
            }
            if (item.hex === hex) {
                return {
                    name: item.name,
                    hex: hex,
                    matchedBy: "exact-hex"
                };
            }
        }

        for (i = 0; i < dataset.length; i++) {
            item = dataset[i];
            d = rgbDistanceSq(rgb, item);
            if (d < bestD) {
                bestD = d;
                best = item;
            }
        }

        if (best) {
            return {
                name: best.name,
                hex: hex,
                matchedBy: "nearest"
            };
        }

        return {
            name: "Unknown / Unmatched Colour",
            hex: hex,
            matchedBy: "fallback"
        };
    }

    function getExistingDocumentOrCreate() {
        var doc;
        if (app.documents.length > 0) {
            doc = app.activeDocument;
            return { doc: doc, createdNew: false };
        }

        doc = app.documents.add(DocumentColorSpace.RGB, OUTPUT_W, OUTPUT_H);
        return { doc: doc, createdNew: true };
    }

    function getPlacementOrigin(doc, createdNew) {
        var abIndex = doc.artboards.getActiveArtboardIndex();
        var rect = doc.artboards[abIndex].artboardRect;
        var left = rect[0];
        var top = rect[1];
        var right = rect[2];
        var margin = 80;

        if (!createdNew) {
            return [right + margin, top];
        }

        return [left, top];
    }

    function getSelectionColorAtIndex(doc, indexZeroBased) {
        try {
            if (!doc.selection || doc.selection.length <= indexZeroBased) return null;
            var item = doc.selection[indexZeroBased];
            if (!item || !item.filled) return null;
            return getIllustratorRGBFromAnyColor(item.fillColor);
        } catch (e) {
            return null;
        }
    }

    function getSwatchNames(doc) {
        var arr = [];
        var i, sw;
        for (i = 0; i < doc.swatches.length; i++) {
            sw = doc.swatches[i];
            arr.push(sw.name);
        }
        return arr;
    }

    function getSwatchColorRGB(doc, swatchName) {
        var i, sw;
        swatchName = trimString(swatchName);
        if (!swatchName) return null;
        try {
            for (i = 0; i < doc.swatches.length; i++) {
                sw = doc.swatches[i];
                if (sw.name === swatchName) {
                    return getIllustratorRGBFromAnyColor(sw.color);
                }
            }
        } catch (e) {}
        return null;
    }

    function averageColor(colors) {
        var i, r = 0, g = 0, b = 0;
        if (!colors.length) return { r: 242, g: 242, b: 242 };
        for (i = 0; i < colors.length; i++) {
            r += colors[i].r;
            g += colors[i].g;
            b += colors[i].b;
        }
        return {
            r: Math.round(r / colors.length),
            g: Math.round(g / colors.length),
            b: Math.round(b / colors.length)
        };
    }

    function chooseBackgroundColor(colors) {
        var avg = averageColor(colors);
        var lum = relativeLuminance(avg);

        if (lum > 150) {
            return { r: 25, g: 28, b: 34 };
        }
        return { r: 245, g: 243, b: 238 };
    }

    function ensureLayer(doc, name) {
        var i, layer;
        for (i = 0; i < doc.layers.length; i++) {
            if (doc.layers[i].name === name) return doc.layers[i];
        }
        layer = doc.layers.add();
        layer.name = name;
        return layer;
    }

    function setTextStyle(tf, fontObj, sizePt, rgb, justification) {
        var tr = tf.textRange;
        tr.characterAttributes.size = sizePt;
        if (fontObj) {
            try { tr.characterAttributes.textFont = fontObj; } catch (e) {}
        }
        tr.characterAttributes.fillColor = makeRGBColor(rgb.r, rgb.g, rgb.b);
        tr.paragraphAttributes.justification = justification || Justification.LEFT;
    }

    function createCard(parentGroup, x, yTop, w, h, fillRGB, info, fontObj, typo, layoutStyle) {
        var cardGroup = parentGroup.groupItems.add();
        cardGroup.name = "Card_" + info.index;

        var rect = cardGroup.pathItems.rectangle(
            yTop,
            x,
            w,
            h
        );
        rect.stroked = false;
        rect.filled = true;
        rect.fillColor = makeRGBColor(fillRGB.r, fillRGB.g, fillRGB.b);
        rect.name = "Card_Rectangle_" + info.index;

        var textRGB = chooseTextRGB(fillRGB);
        var cmyk = rgbToCMYK(info.rgb.r, info.rgb.g, info.rgb.b);

        var nameText = info.name;
        var rgbText = "RGB " + info.rgb.r + ", " + info.rgb.g + ", " + info.rgb.b;
        var cmykText = "CMYK " + cmyk.c + ", " + cmyk.m + ", " + cmyk.y + ", " + cmyk.k;
        var hexText = "#" + info.hex;

        if (layoutStyle === "Vertical") {
            drawVerticalCard(
                cardGroup,
                x,
                yTop,
                w,
                h,
                info.index,
                nameText,
                rgbText,
                cmykText,
                hexText,
                textRGB,
                fontObj,
                typo
            );
        } else {
            drawHorizontalCard(
                cardGroup,
                x,
                yTop,
                w,
                h,
                info.index,
                nameText,
                rgbText,
                cmykText,
                hexText,
                textRGB,
                fontObj,
                typo
            );
        }

        return cardGroup;
    }

    function drawHorizontalCard(cardGroup, x, yTop, w, h, cardIndex, nameText, rgbText, cmykText, hexText, textRGB, fontObj, typo) {
        var leftPad = Math.max(40, Math.round(w * 0.04));
        var rightPad = Math.max(40, Math.round(w * 0.04));
        var centerGap = Math.max(22, Math.round(w * 0.025));

        var nameAreaW = Math.round(w * 0.36);
        var metaAreaW = Math.round(w * 0.34);
        var hexAreaW = w - leftPad - rightPad - nameAreaW - metaAreaW - (centerGap * 2);

        if (hexAreaW < 140) {
            hexAreaW = 140;
            metaAreaW = w - leftPad - rightPad - nameAreaW - hexAreaW - (centerGap * 2);
        }

        if (metaAreaW < 180) {
            metaAreaW = 180;
            nameAreaW = w - leftPad - rightPad - metaAreaW - hexAreaW - (centerGap * 2);
        }

        var nameLeft = x + leftPad;
        var metaLeft = nameLeft + nameAreaW + centerGap;
        var hexLeft = metaLeft + metaAreaW + centerGap;

        var titleSize = typo.titleSize;
        var metaSize = typo.rgbSize;
        var hexSize = typo.hexSize;

        var titleH = Math.max(titleSize + 12, 34);
        var metaH = Math.max(metaSize + 10, 24);
        var hexH = Math.max(hexSize + 10, 24);
        var lineGap = Math.max(8, Math.round(metaSize * 0.5));

        var metaBlockH = (metaH * 2) + lineGap;
        var centerY = yTop - (h / 2);

        var nameTop = centerY + (titleH / 2);
        var rgbTop = centerY + (metaBlockH / 2);
        var cmykTop = rgbTop - metaH - lineGap;
        var hexTop = centerY + (hexH / 2);

        var tfName = cardGroup.textFrames.areaText(makeRectPath(cardGroup, nameLeft, nameTop, nameAreaW, titleH));
        tfName.contents = nameText;
        tfName.name = "Colour_Name_" + cardIndex;
        setTextStyle(tfName, fontObj, titleSize, textRGB, Justification.LEFT);

        var tfRGB = cardGroup.textFrames.areaText(makeRectPath(cardGroup, metaLeft, rgbTop, metaAreaW, metaH));
        tfRGB.contents = rgbText;
        tfRGB.name = "RGB_" + cardIndex;
        setTextStyle(tfRGB, fontObj, metaSize, textRGB, Justification.LEFT);

        var tfCMYK = cardGroup.textFrames.areaText(makeRectPath(cardGroup, metaLeft, cmykTop, metaAreaW, metaH));
        tfCMYK.contents = cmykText;
        tfCMYK.name = "CMYK_" + cardIndex;
        setTextStyle(tfCMYK, fontObj, metaSize, textRGB, Justification.LEFT);

        var tfHex = cardGroup.textFrames.areaText(makeRectPath(cardGroup, hexLeft, hexTop, hexAreaW, hexH));
        tfHex.contents = hexText;
        tfHex.name = "HEX_" + cardIndex;
        setTextStyle(tfHex, fontObj, hexSize, textRGB, Justification.RIGHT);
    }

    function drawVerticalCard(cardGroup, x, yTop, w, h, cardIndex, nameText, rgbText, cmykText, hexText, textRGB, fontObj, typo) {
        var titleSize = typo.titleSize;
        var metaSize = typo.rgbSize;
        var hexSize = typo.hexSize;

        var centerX = x + (w / 2);
        var centerY = yTop - (h / 2);

        var hexY = yTop - (h * 0.12);
        var metaY = centerY;
        var nameY = yTop - (h * 0.86);

        var metaColumnGap = Math.max(18, Math.min(36, Math.round(w * 0.16)));
        var rgbX = centerX - (metaColumnGap / 2);
        var cmykX = centerX + (metaColumnGap / 2);

        createVerticalPointText(cardGroup, hexText, "HEX_" + cardIndex, fontObj, hexSize, textRGB, centerX, hexY);
        createVerticalPointText(cardGroup, rgbText, "RGB_" + cardIndex, fontObj, metaSize, textRGB, rgbX, metaY);
        createVerticalPointText(cardGroup, cmykText, "CMYK_" + cardIndex, fontObj, metaSize, textRGB, cmykX, metaY);
        createVerticalPointText(cardGroup, nameText, "Colour_Name_" + cardIndex, fontObj, titleSize, textRGB, centerX, nameY);
    }

    function createVerticalPointText(cardGroup, content, itemName, fontObj, fontSize, textRGB, targetX, targetY) {
        var tf = cardGroup.textFrames.add();
        tf.contents = content;
        tf.name = itemName;
        tf.kind = TextType.POINTTEXT;
        setPointTextStyle(tf, fontObj, fontSize, textRGB);
        tf.rotate(90);
        centerTextFrameOnPoint(tf, targetX, targetY);
        return tf;
    }

    function setPointTextStyle(tf, fontObj, fontSize, textRGB) {
        try {
            var tr = tf.textRange;
            tr.size = fontSize;
            tr.fillColor = makeRGBColor(textRGB.r, textRGB.g, textRGB.b);
            tr.characterAttributes.textFont = fontObj;
            tr.paragraphAttributes.justification = Justification.CENTER;
            tr.characterAttributes.tracking = 0;
            tr.characterAttributes.leading = fontSize * 1.15;
        } catch (e) {}
    }

    function centerTextFrameOnPoint(tf, targetX, targetY) {
        try {
            var gb = tf.visibleBounds;
            var currentCX = (gb[1] + gb[3]) / 2;
            var currentCY = (gb[0] + gb[2]) / 2;
            tf.translate(targetX - currentCX, targetY - currentCY);
        } catch (e) {
            try {
                var gb2 = tf.geometricBounds;
                var currentCX2 = (gb2[1] + gb2[3]) / 2;
                var currentCY2 = (gb2[0] + gb2[2]) / 2;
                tf.translate(targetX - currentCX2, targetY - currentCY2);
            } catch (e2) {}
        }
    }

    function makeRectPath(parentGroup, x, yTop, w, h) {
        var p = parentGroup.pathItems.rectangle(yTop, x, w, h);
        p.stroked = false;
        p.filled = false;
        return p;
    }

    function extractRGBList(colorsData) {
        var arr = [], i;
        for (i = 0; i < colorsData.length; i++) arr.push(copyRGB(colorsData[i].rgb));
        return arr;
    }

    function generateArtwork(doc, colorsData, fontObj, typo, createdNewDoc, layoutStyle) {
        var layer = ensureLayer(doc, "AweddenStudio Output");
        layer.locked = false;
        layer.visible = true;

        var root = layer.groupItems.add();
        root.name = "AweddenStudio_Colour_Details_Artwork";

        var origin = getPlacementOrigin(doc, createdNewDoc);
        var x0 = origin[0];
        var y0 = origin[1];

        var cardsGroup = root.groupItems.add();
        cardsGroup.name = "Cards";

        var count = colorsData.length;
        var i, cardW, cardH, topY, leftX;

        if (layoutStyle === "Vertical") {
            cardW = Math.floor(OUTPUT_W / count);
            cardH = OUTPUT_H;

            for (i = 0; i < count; i++) {
                leftX = x0 + (cardW * i);

                createCard(
                    cardsGroup,
                    leftX,
                    y0,
                    (i === count - 1 ? OUTPUT_W - (cardW * i) : cardW),
                    cardH,
                    colorsData[i].rgb,
                    {
                        index: i + 1,
                        name: colorsData[i].matched.name,
                        hex: colorsData[i].hex,
                        rgb: colorsData[i].rgb
                    },
                    fontObj,
                    typo,
                    "Vertical"
                );
            }
        } else {
            cardW = OUTPUT_W;
            cardH = Math.floor(OUTPUT_H / count);

            for (i = 0; i < count; i++) {
                topY = y0 - (cardH * i);

                createCard(
                    cardsGroup,
                    x0,
                    topY,
                    cardW,
                    (i === count - 1 ? OUTPUT_H - (cardH * i) : cardH),
                    colorsData[i].rgb,
                    {
                        index: i + 1,
                        name: colorsData[i].matched.name,
                        hex: colorsData[i].hex,
                        rgb: colorsData[i].rgb
                    },
                    fontObj,
                    typo,
                    "Horizontal"
                );
            }
        }

        root.selected = true;
        return root;
    }

    function buildUI(doc, dataset) {
        var dlg = new Window("dialog", SCRIPT_NAME);
        dlg.orientation = "column";
        dlg.alignChildren = ["fill", "top"];
        dlg.spacing = 10;
        dlg.margins = 16;

        var titleGroup = dlg.add("group");
        titleGroup.orientation = "column";
        titleGroup.alignChildren = ["left", "top"];
        titleGroup.add("statictext", undefined, "Colour Details Artwork");
        titleGroup.add("statictext", undefined, "Size: 1080 x 1350 px");

        var stylePanel = dlg.add("panel", undefined, "Card Style");
        stylePanel.orientation = "row";
        stylePanel.alignChildren = ["left", "center"];
        stylePanel.margins = 12;

        stylePanel.add("statictext", undefined, "Style");
        var styleDropdown = stylePanel.add("dropdownlist", undefined, [
            "Horizontal",
            "Vertical"
        ]);
        styleDropdown.selection = 0;

        var helpPanel = dlg.add("panel", undefined, "Supported Colour Input Workflow");
        helpPanel.orientation = "column";
        helpPanel.alignChildren = ["left", "top"];
        helpPanel.margins = 12;
        helpPanel.add("statictext", undefined, "Choose one source for all enabled colour slots.");
        helpPanel.add("statictext", undefined, "Selected Object Fill = reads fill from selected object #1 to #5");
        helpPanel.add("statictext", undefined, "Swatch = choose one swatch per enabled colour slot");
        helpPanel.add("statictext", undefined, "Manual RGB = enter RGB values per enabled colour slot");

        var globalSourcePanel = dlg.add("panel", undefined, "Colour Source");
        globalSourcePanel.orientation = "row";
        globalSourcePanel.alignChildren = ["left", "center"];
        globalSourcePanel.margins = 12;

        globalSourcePanel.add("statictext", undefined, "Source");
        var globalSourceDropdown = globalSourcePanel.add("dropdownlist", undefined, [
            "Selected Object Fill",
            "Swatch",
            "Manual RGB"
        ]);
        globalSourceDropdown.selection = 0;

        var tabPanel = dlg.add("tabbedpanel");
        tabPanel.alignChildren = ["fill", "fill"];
        tabPanel.preferredSize = [720, 360];

        var swatchNames = [];
        try { swatchNames = getSwatchNames(doc); } catch (e) {}

        var slotControls = [];
        var i;

        for (i = 0; i < MAX_SLOTS; i++) {
            var tab = tabPanel.add("tab", undefined, "Colour " + (i + 1));
            tab.orientation = "column";
            tab.alignChildren = ["fill", "top"];
            tab.margins = 14;

            var enabledChk = tab.add("checkbox", undefined, "Use this colour slot");
            enabledChk.value = (i === 0);

            var selectedInfo = tab.add("panel", undefined, "Selection Slot");
            selectedInfo.orientation = "column";
            selectedInfo.alignChildren = ["left", "top"];
            selectedInfo.margins = 10;
            selectedInfo.add("statictext", undefined, "Uses selected object #" + (i + 1) + " from the active document.");
            selectedInfo.add("statictext", undefined, "Select objects before running the script.");

            var swatchPanel = tab.add("panel", undefined, "Swatch");
            swatchPanel.orientation = "row";
            swatchPanel.alignChildren = ["left", "center"];
            swatchPanel.margins = 10;
            swatchPanel.add("statictext", undefined, "Swatch name");
            var swatchDropdown = swatchPanel.add("dropdownlist", undefined, swatchNames.length ? swatchNames : ["<No swatches available>"]);
            swatchDropdown.selection = 0;

            var manualPanel = tab.add("panel", undefined, "Manual RGB");
            manualPanel.orientation = "row";
            manualPanel.alignChildren = ["left", "center"];
            manualPanel.margins = 10;

            manualPanel.add("statictext", undefined, "R");
            var rEt = manualPanel.add("edittext", undefined, "255"); rEt.characters = 4;
            manualPanel.add("statictext", undefined, "G");
            var gEt = manualPanel.add("edittext", undefined, "255"); gEt.characters = 4;
            manualPanel.add("statictext", undefined, "B");
            var bEt = manualPanel.add("edittext", undefined, "255"); bEt.characters = 4;

            slotControls.push({
                enabledChk: enabledChk,
                selectedInfo: selectedInfo,
                swatchPanel: swatchPanel,
                swatchDropdown: swatchDropdown,
                manualPanel: manualPanel,
                rEt: rEt,
                gEt: gEt,
                bEt: bEt
            });
        }

        function refreshAllSlotVisibility() {
            var src = globalSourceDropdown.selection ? globalSourceDropdown.selection.text : "Selected Object Fill";
            var j, enabled;

            for (j = 0; j < slotControls.length; j++) {
                enabled = slotControls[j].enabledChk.value;
                slotControls[j].selectedInfo.visible = enabled && src === "Selected Object Fill";
                slotControls[j].swatchPanel.visible = enabled && src === "Swatch";
                slotControls[j].manualPanel.visible = enabled && src === "Manual RGB";
            }
        }

        for (i = 0; i < slotControls.length; i++) {
            slotControls[i].enabledChk.onClick = refreshAllSlotVisibility;
        }
        globalSourceDropdown.onChange = refreshAllSlotVisibility;
        refreshAllSlotVisibility();

        var typoPanel = dlg.add("panel", undefined, "Typography");
        typoPanel.orientation = "column";
        typoPanel.alignChildren = ["fill", "top"];
        typoPanel.margins = 12;

        var fontRow = typoPanel.add("group");
        fontRow.add("statictext", undefined, "Font");
        var fontNames = [];
        try {
            for (i = 0; i < app.textFonts.length; i++) {
                fontNames.push(app.textFonts[i].name);
            }
        } catch (eFonts) {
            fontNames = ["ArialMT"];
        }

        var fontDropdown = fontRow.add("dropdownlist", undefined, fontNames.length ? fontNames : ["ArialMT"]);
        fontDropdown.preferredSize.width = 340;
        fontDropdown.selection = 0;

        var szRow = typoPanel.add("group");
        szRow.orientation = "row";
        szRow.alignChildren = ["left", "center"];
        szRow.add("statictext", undefined, "Colour title size");
        var titleSizeEt = szRow.add("edittext", undefined, "24"); titleSizeEt.characters = 4;
        szRow.add("statictext", undefined, "HEX size");
        var hexSizeEt = szRow.add("edittext", undefined, "16"); hexSizeEt.characters = 4;
        szRow.add("statictext", undefined, "RGB size");
        var rgbSizeEt = szRow.add("edittext", undefined, "16"); rgbSizeEt.characters = 4;

        var bottom = dlg.add("group");
        bottom.alignment = "right";
        bottom.add("button", undefined, "Cancel", { name: "cancel" });
        var okBtn = bottom.add("button", undefined, "Generate", { name: "ok" });

        okBtn.onClick = function () {
            try {
                var results = [];
                var usedCount = 0;
                var j, src, rgb, swName, fontObj, titleSize, hexSize, rgbSize;

                src = globalSourceDropdown.selection ? globalSourceDropdown.selection.text : "Selected Object Fill";

                for (j = 0; j < MAX_SLOTS; j++) {
                    if (!slotControls[j].enabledChk.value) continue;
                    usedCount++;
                }

                if (usedCount < 1) {
                    alert("Please enable at least 1 colour slot.");
                    return;
                }

                titleSize = clamp(safeInt(titleSizeEt.text, 24), 6, 300);
                hexSize = clamp(safeInt(hexSizeEt.text, 16), 6, 300);
                rgbSize = clamp(safeInt(rgbSizeEt.text, 16), 6, 300);

                fontObj = resolveSafeFontByName(fontDropdown.selection ? fontDropdown.selection.text : "");

                for (j = 0; j < MAX_SLOTS; j++) {
                    if (!slotControls[j].enabledChk.value) continue;

                    if (src === "Selected Object Fill") {
                        rgb = getSelectionColorAtIndex(doc, j);
                        if (!rgb) {
                            alert("Colour " + (j + 1) + ": no valid filled selected object found for slot " + (j + 1) + ".");
                            return;
                        }
                    } else if (src === "Swatch") {
                        swName = slotControls[j].swatchDropdown.selection ? slotControls[j].swatchDropdown.selection.text : "";
                        rgb = getSwatchColorRGB(doc, swName);
                        if (!rgb) {
                            alert("Colour " + (j + 1) + ": unable to resolve swatch colour.");
                            return;
                        }
                    } else {
                        rgb = {
                            r: clamp(safeInt(slotControls[j].rEt.text, 255), 0, 255),
                            g: clamp(safeInt(slotControls[j].gEt.text, 255), 0, 255),
                            b: clamp(safeInt(slotControls[j].bEt.text, 255), 0, 255)
                        };
                    }

                    results.push({
                        index: j + 1,
                        rgb: rgb,
                        hex: rgbToHex(rgb.r, rgb.g, rgb.b),
                        matched: matchColorName(rgb, dataset)
                    });
                }

                dlg.close(1);
                dlg.__result = {
                    colors: results,
                    fontObj: fontObj,
                    layoutStyle: styleDropdown.selection ? styleDropdown.selection.text : "Horizontal",
                    typo: {
                        titleSize: titleSize,
                        hexSize: hexSize,
                        rgbSize: rgbSize
                    }
                };

            } catch (uiErr) {
                alert("Unable to validate dialog input.\n\n" + uiErr);
            }
        };

        var result = dlg.show();
        if (result !== 1 || !dlg.__result) return null;
        return dlg.__result;
    }

    try {
        var dataset = parseColorWorldData(RAW_COLOR_WORLD_DATA);
        if (!dataset || dataset.length === 0) {
            alert("Color World dataset is empty.\nPlease insert valid data into RAW_COLOR_WORLD_DATA.");
            return;
        }

        var docInfo = getExistingDocumentOrCreate();
        var doc = docInfo.doc;

        var ui = buildUI(doc, dataset);
        if (!ui) return;

        app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;

        var artwork = generateArtwork(doc, ui.colors, ui.fontObj, ui.typo, docInfo.createdNew, ui.layoutStyle);

        try {
            app.redraw();
        } catch (redrawErr) {}

        alert(
            "Artwork generated successfully.\n\n" +
            "Cards: " + ui.colors.length + "\n" +
            "Group: " + artwork.name + "\n" +
            "Layer: AweddenStudio Output"
        );

    } catch (err) {
        alert(
            SCRIPT_NAME + " encountered an unexpected error.\n\n" +
            "Message: " + err.message + "\n" +
            "Line: " + (err.line || "unknown")
        );
    }

})();