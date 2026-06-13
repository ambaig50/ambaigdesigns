// utils/templateComponents.js
// Static dynamic-import map so Next.js can correctly code-split each template.
import dynamic from "next/dynamic";

const componentMap = {
  minimalist: {
    boldcentered: dynamic(() => import("../components/templates/minimalist/BoldCentered")),
    circlebadge: dynamic(() => import("../components/templates/minimalist/CircleBadge")),
    darkthemeaccent: dynamic(() => import("../components/templates/minimalist/DarkThemeAccent")),
    gridlayout: dynamic(() => import("../components/templates/minimalist/GridLayout")),
    icontext: dynamic(() => import("../components/templates/minimalist/IconText")),
    monochromecontrast: dynamic(() => import("../components/templates/minimalist/MonochromeContrast")),
    pastelgradient: dynamic(() => import("../components/templates/minimalist/PastelGradient")),
    quoteblock: dynamic(() => import("../components/templates/minimalist/QuoteBlock")),
    splitbackground: dynamic(() => import("../components/templates/minimalist/SplitBackground")),
    underlineaccent: dynamic(() => import("../components/templates/minimalist/UnderlineAccent")),
  },
  lifestyle: {
    coffeebreak: dynamic(() => import("../components/templates/Lifestyle/CoffeeBreak")),
    cozylivingroom: dynamic(() => import("../components/templates/Lifestyle/CozyLivingRoom")),
    deskscene: dynamic(() => import("../components/templates/Lifestyle/DeskScene")),
    journalcandle: dynamic(() => import("../components/templates/Lifestyle/JournalCandle")),
    kitchencounter: dynamic(() => import("../components/templates/Lifestyle/KitchenCounter")),
    morningroutine: dynamic(() => import("../components/templates/Lifestyle/MorningRoutine")),
    plannerpage: dynamic(() => import("../components/templates/Lifestyle/PlannerPage")),
    stationaryflatlay: dynamic(() => import("../components/templates/Lifestyle/StationaryFlatLay")),
    travelessentials: dynamic(() => import("../components/templates/Lifestyle/TravelEssentials")),
    workspaceplants: dynamic(() => import("../components/templates/Lifestyle/WorkspacePlants")),
  },
  nature: {
    floralborder: dynamic(() => import("../components/templates/Nature/FloralBorder")),
    forestcanopy: dynamic(() => import("../components/templates/Nature/ForestCanopy")),
    grassfield: dynamic(() => import("../components/templates/Nature/GrassField")),
    leafpattern: dynamic(() => import("../components/templates/Nature/LeafPattern")),
    mountainsilhouette: dynamic(() => import("../components/templates/Nature/MountainSilhouette")),
    oceanwaves: dynamic(() => import("../components/templates/Nature/OceanWaves")),
    skyclouds: dynamic(() => import("../components/templates/Nature/SkyClouds")),
    sunsetgradient: dynamic(() => import("../components/templates/Nature/SunsetGradient")),
    treebark: dynamic(() => import("../components/templates/Nature/TreeBark")),
    waterripple: dynamic(() => import("../components/templates/Nature/WaterRipple")),
  },
  business: {
    boldheadline: dynamic(() => import("../components/templates/Business/BoldHeadline")),
    businesscardoverlay: dynamic(() => import("../components/templates/Business/BusinessCardOverlay")),
    chartbackground: dynamic(() => import("../components/templates/Business/ChartBackground")),
    corporateblue: dynamic(() => import("../components/templates/Business/CorporateBlue")),
    darkprofessional: dynamic(() => import("../components/templates/Business/DarkProfessional")),
    geometricshapes: dynamic(() => import("../components/templates/Business/GeometricShapes")),
    infographicstyle: dynamic(() => import("../components/templates/Business/InfographicStyle")),
    officedesk: dynamic(() => import("../components/templates/Business/OfficeDesk")),
    presentationslide: dynamic(() => import("../components/templates/Business/PresentationSlide")),
    techabstract: dynamic(() => import("../components/templates/Business/TechAbstract")),
  },
  food: {
    chalkboardmenu: dynamic(() => import("../components/templates/Food/ChalkboardMenu")),
    coffeebeans: dynamic(() => import("../components/templates/Food/CoffeeBeans")),
    cuttingboard: dynamic(() => import("../components/templates/Food/CuttingBoard")),
    dessertshowcase: dynamic(() => import("../components/templates/Food/DessertShowcase")),
    fruitbasket: dynamic(() => import("../components/templates/Food/FruitBasket")),
    ingredientsflatlay: dynamic(() => import("../components/templates/Food/IngredientsFlatLay")),
    kitchencounterfood: dynamic(() => import("../components/templates/Food/KitchenCounterFood")),
    recipecard: dynamic(() => import("../components/templates/Food/RecipeCard")),
    rustictable: dynamic(() => import("../components/templates/Food/RusticTable")),
    styleddish: dynamic(() => import("../components/templates/Food/StyledDish")),
  },
};

export function getTemplateComponent(category, id) {
  return componentMap[category]?.[id] || null;
}

export default componentMap;
