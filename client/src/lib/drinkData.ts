export interface DrinkItem {
    name: string;
}

export interface DrinkCategory {
    name: string;
    items: DrinkItem[];
}

export const drinkCategories: DrinkCategory[] = [
    {
        name: "ATSPIRDZINOŠIE DZĒRIENI",
        items: [
            { name: "Ūdens b/g Mangaļi 0.33l" },
            { name: "Ūdens a/g Mangaļi 0.33l" },
            { name: "Ūdens b/g Acqua Panna 0.25l" },
            { name: "Ūdens b/g Acqua Panna 0.75l" },
            { name: "Ūdens a/g S.Pellegrino 0.25l" },
            { name: "Ūdens a/g S.Pellegrino 0.75l" },
            { name: "Pepsi Cola" },
            { name: "Mirinda" },
            { name: "7Up" },
            { name: "Toniks Fever-Tree Indian" },
            { name: "Toniks Fever-Tree Mediterranean" },
            { name: "Toniks Fever-Tree Aromatic" },
            { name: "Toniks Fever-Tree Ginger Ale" },
            { name: "Fentimans Rose" },
            { name: "Fentimans Cherry Cola" },
            { name: "Fentimans Mandarin Orange Jigger" },
            { name: "Izlejamais Lāčplēša kvass 0.5l" },
            { name: "Kvass 0.3l" },
            { name: "Limonāde Aveņu 0.4l" },
            { name: "Limonāde Rabarberu 0.4l" },
            { name: "Limonāde Smiltsērkšķu 0.4l" },
        ],
    },
    {
        name: "KARSTIE DZĒRIENI",
        items: [
            { name: "Espreso" },
            { name: "Makiato" },
            { name: "Dubultais espresso" },
            { name: "Kafija melna" },
            { name: "Kafija balta" },
            { name: "Latte" },
            { name: "Latte Dubultais" },
            { name: "Cappucino" },
            { name: "Cappucino dubultais" },
            { name: "Kakao" },
            { name: "Melnā tēja" },
            { name: "Zaļā tēja" },
            { name: "Augļu tēja" },
            { name: "Piparmētru tēja" },
            { name: "Grenadīntēja" },
        ],
    },
    {
        name: "KOKTEIĻI",
        items: [
            { name: "Mājas karstvīns" },
            { name: "Aperol Spritz" },
        ],
    },
    {
        name: "BEZALKOHOLISKIE KOKTEIĻI",
        items: [
            { name: "Aperol non-alc" },
            { name: "Zemeņu" },
            { name: "Plūmju" },
            { name: "Šokolādes zemene" },
            { name: "Ledus tēja" },
            { name: "Ledus kafija" },
            { name: "Mojito" },
            { name: "Zemeņu Mojito" },
            { name: "Citrusu Mojito" },
        ],
    },
    {
        name: "SULAS",
        items: [
            { name: "Sula apelsīnu" },
            { name: "Sula ābolu" },
            { name: "Sula tomātu" },
            { name: "Sula persiku" },
            { name: "Sula plūmju" },
            { name: "Svaigā sula apelsīnu 250ml" },
            { name: "Svaigā sula greipfrūtu 250ml" },
            { name: "Svaigā sula burkānu 250ml" },
        ],
    },
    {
        name: "KEFĪRS UN PIENS",
        items: [
            { name: "Kefīrs" },
            { name: "Piens" },
        ],
    },
    {
        name: "DZIRKSTOŠIE VĪNI",
        items: [
            { name: "Domus Picta Prosecco 150ml" },
            { name: "Domus Picta Prosecco 75cl" },
            { name: "Contadi Castaldi Franciacorta Brut 37.5cl" },
            { name: "Segura Viudas Rosado Brut CAVA 75cl" },
            { name: "Tissot-Maire Cremant du Jura 75cl" },
            { name: "Les Cocottes Chardonnay non-alc 150ml" },
            { name: "Les Cocottes Chardonnay non-alc 75cl" },
            // Īpašo vīnu selekcija
            { name: "Ruggeri Cartizze Prosecco Brut 75cl" },
            { name: "Bellavista Alma Franciacorta Extra Brut 75cl" },
        ],
    },
    {
        name: "ŠAMPANIETIS",
        items: [
            { name: "Jean Pernet Le Mesnil Grand Cru 37.5cl" },
            { name: "Taittinger Brut Reserve 37.5cl" },
            { name: "Bollinger Special Cuvee 75cl" },
            { name: "Taittinger Prelude Grand Cru 75cl" },
            // Īpašo vīnu selekcija
            { name: "Ayala Brut Rose Majeur 75cl" },
            { name: "Vilmart Grand Cellier d'Or Brut 2019 75cl" },
        ],
    },
    {
        name: "SĀRTVĪNS",
        items: [
            { name: "Zenato Bardolino Chiaretto 150ml" },
            { name: "Zenato Bardolino Chiaretto 75cl" },
            { name: "Studio by Miraval Rose 75cl" },
            // Īpašo vīnu selekcija
            { name: "Miraval Rose Provence 75cl" },
        ],
    },
    {
        name: "BALTVĪNI",
        items: [
            { name: "Perrin La Vieille Ferme Blanc 37.5cl" },
            { name: "El Coto Blanco Rioja 37.5cl" },
            { name: "Zenato Pinot Grigio 37.5cl" },
            { name: "Louis Latour Bourgogne Chardonnay 37.5cl" },
            { name: "Dollfly river Sauvignon Blanc 150ml" },
            { name: "Dollfly river Sauvignon Blanc 75cl" },
            { name: "Cascas Vinho Verde 75cl" },
            { name: "Aragosta Vermentino Di Sardegna 75cl" },
            { name: "La Villete Chardonnay 75cl" },
            { name: "Dr. Hermann Riesling Trocken 75cl" },
            // Īpašo vīnu selekcija
            { name: "Domaine Vacheron Sancerre 2024 75cl" },
            { name: "E.Guigal Condrieu 2020 75cl" },
            { name: "Alois Lageder Pinot Grigio 2023 75cl" },
            { name: "Pieropan Calvarino Soave Classico 2023 75cl" },
            { name: "Hacienda Arinzano Chardonnay 2022 75cl" },
            { name: "Domane Wachau Gruner Veltliner 2023 75cl" },
        ],
    },
    {
        name: "SARKANVĪNI",
        items: [
            { name: "Perrin La Vieille Ferme Rouge 37.5cl" },
            { name: "E. Guigal Cotes-du-Rhone 37.5cl" },
            { name: "El Coto de Rioja Crianza 37.5cl" },
            { name: "San Felice Chianti Classico 37.5cl" },
            { name: "Zuccardi Serie A Malbec 150ml" },
            { name: "Zuccardi Serie A Malbec 75cl" },
            { name: "Cascas Tinto Lisboa 75cl" },
            { name: "Arzuaga Crianza 75cl" },
            { name: "Cono Sur Cabernet Sauvignon Reserva 75cl" },
            { name: "Salentein Killka Malbec 75cl" },
            { name: "Conte di Campiano Riserva Primitivo 75cl" },
            { name: "Poesie Valpolicella Ripasso 75cl" },
            // Īpašo vīnu selekcija
            { name: "Mongeard Mugneret Bourgogne 2021 75cl" },
            { name: "Chateau La Tour Figeac St.Emilion 2020 75cl" },
            { name: "Coudolet de Beaucastel 2022 75cl" },
            { name: "E.Guigal Hermitage 2020 75cl" },
            { name: "Tenuta Fertuna Lodai Cabernet 75cl" },
            { name: "il Poggione Brunello di Montalcino 2019 75cl" },
            { name: "Planeta Santa Cecilia 2021 75cl" },
            { name: "Vietti Barolo 2021 75cl" },
            { name: "Pesquera Crianza 2022 75cl" },
            { name: "Flor de Pingus 2022 75cl" },
            { name: "Henschke Henry Seven 2023 75cl" },
            { name: "Achaval Ferrer Quimera 2021 75cl" },
            { name: "Double Diamond Cabernet Sauvignon 2022 75cl" },
        ],
    },
    {
        name: "ALUS — PUDELES",
        items: [
            { name: "Corona 0.33l" },
            { name: "Kokmuižas b/a alus" },
            { name: "Beļģu ķiršu alus Bacchus" },
        ],
    },
    {
        name: "ALUS — IZLEJAMAIS",
        items: [
            { name: "Madonas gaišais 0.5l" },
            { name: "Madonas gaišais 0.3l" },
        ],
    },
    {
        name: "CRAFT ALUS",
        items: [
            { name: "Malduguns Cilpa 5.3% 0.44l" },
            { name: "Malduguns Pēdējais viesis 5.6% 0.44l" },
            { name: "Malduguns Novirze hazy IPA 6.3% 0.44l" },
            { name: "Malduguns Sānslīde IPA 6.5% 0.44l" },
        ],
    },
    {
        name: "DŽINS",
        items: [
            { name: "Hendrick's Gin 4cl" },
            { name: "Hayman's London Dry Gin 4cl" },
            { name: "Tanqueray Ten Gin 4cl" },
            { name: "Caorunn Scottish Gin 4cl" },
        ],
    },
    {
        name: "KONJAKI",
        items: [
            { name: "Hennessy V.S. 4cl" },
            { name: "Hennessy V.S.O.P. 4cl" },
            { name: "A.De Fussigny XO 4cl" },
        ],
    },
    {
        name: "VODKA",
        items: [
            { name: "Stolichnaya 4cl" },
            { name: "Stolichnaya Elit 4cl" },
        ],
    },
    {
        name: "TEKILA",
        items: [
            { name: "Rooster Rojo Blanco 4cl" },
            { name: "Rooster Rojo Reposado 4cl" },
        ],
    },
    {
        name: "VISKIJS",
        items: [
            { name: "Jack Daniels 4cl" },
            { name: "Jameson 4cl" },
            { name: "Monkey Shoulder 4cl" },
            { name: "Bulleit Bourbon 4cl" },
            { name: "Lagavulin 16y 4cl" },
        ],
    },
    {
        name: "VERMUTS",
        items: [
            { name: "Martini Bianco/Dry 10cl" },
            { name: "Campari 4cl" },
            { name: "Aperol 4cl" },
            { name: "Antica Formula 4cl" },
        ],
    },
    {
        name: "RUMS",
        items: [
            { name: "Havana Club (gaišais/tumšais) 4cl" },
            { name: "Plantation Grande Reserve" },
            { name: "Don Papa BAROKO 4cl" },
            { name: "Zacapa 23 Yo 4cl" },
            { name: "Zacapa XO 4cl" },
        ],
    },
    {
        name: "CITI DZĒRIENI",
        items: [
            { name: "Rīgas melnais balzāms 4cl" },
            { name: "Jagermeister 4cl" },
            { name: "Portvīns Kopke L.B.V. 2018 7cl" },
            { name: "Portvīns Tawny Porto 7cl" },
            { name: "Calvados Busnel Hors d'Age 4cl" },
        ],
    },
];
