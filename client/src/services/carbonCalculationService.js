// services/carbonCalculationService.js
import { ProjectType } from '@/types/project';

/**
 * Service for calculating carbon credits based on project type and characteristics
 * Using methodologies aligned with international carbon credit standards
 */
export const carbonCalculationService = {
  /**
   * Calculate carbon credits based on project type
   * @param {Object} project - The project object
   * @returns {number} - Calculated carbon credits (tons of CO2 equivalent)
   */
  calculateCredits(project) {
    if (!project || !project.projectType) {
      console.error('Invalid project data for carbon calculation');
      return 0;
    }

    // Duration in years - calculate from project dates if available
    const duration = this.calculateProjectDuration(project);

    // Apply appropriate calculation method based on project type
    switch(project.projectType) {
      case 'Reforestation':
        return this.calculateReforestationCredits(project, duration);
      case 'Solar':
        return this.calculateSolarCredits(project, duration);
      case 'Wind':
        return this.calculateWindCredits(project, duration);
      case 'Conservation':
        return this.calculateConservationCredits(project, duration);
      case 'Methane Capture':
        return this.calculateMethaneCaptureCredits(project, duration);
      case 'Energy Efficiency':
        return this.calculateEnergyEfficiencyCredits(project, duration);
      case 'Biomass':
        return this.calculateBiomassCredits(project, duration);
      default:
        console.warn(`No calculation method for project type: ${project.projectType}`);
        return 0;
    }
  },

  /**
   * Calculate project duration in years based on start and end dates
   * @param {Object} project - The project object
   * @returns {number} - Project duration in years (default: 10 years)
   */
  calculateProjectDuration(project) {
    // If both start and end dates are available, calculate the duration
    if (project.startDate && project.endDate) {
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationYears = durationMs / (1000 * 60 * 60 * 24 * 365.25);
      return Math.max(1, Math.round(durationYears));
    }
    
    // Default duration if dates are not specified (10-year crediting period)
    return 10;
  },

  /**
   * Calculate carbon credits for reforestation projects
   * @param {Object} project - The project object
   * @param {number} duration - Project duration in years
   * @returns {number} - Calculated carbon credits
   */
  calculateReforestationCredits(project, duration) {
    // Carbon sequestration varies by region, tree species, and forest type
    // Values based on IPCC Guidelines for National Greenhouse Gas Inventories
    const sequestrationRates = {
      tropical: 10, // tons CO2 per hectare per year
      temperate: 7,
      boreal: 3,
      default: 5
    };

    // Extract region from project location, defaulting to "default"
    const region = this.determineRegion(project.location) || 'default';
    const sequestrationRate = sequestrationRates[region] || sequestrationRates.default;

    // Maturity factors adjust for forest growth curve - young forests sequester less carbon
    // Ages: 0-5 years = 0.5, 5-15 years = 0.8, 15+ years = 1.0
    let maturityFactor = 0.7; // default
    if (duration <= 5) {
      maturityFactor = 0.5;
    } else if (duration <= 15) {
      maturityFactor = 0.8;
    } else {
      maturityFactor = 1.0;
    }

    // Calculate total carbon sequestration over project lifetime
    // Apply a 20% buffer for leakage and non-permanence risks
    const totalSequestration = project.area * sequestrationRate * maturityFactor * duration;
    const bufferPercentage = 0.2;
    const creditableSequestration = totalSequestration * (1 - bufferPercentage);
    
    return Math.round(creditableSequestration);
  },

  /**
   * Calculate carbon credits for solar energy projects
   * @param {Object} project - The project object
   * @param {number} duration - Project duration in years
   * @returns {number} - Calculated carbon credits
   */
  calculateSolarCredits(project, duration) {
    // Estimate system capacity if not explicitly provided
    // Typical solar farm: 1 MW requires ~2 hectares of land
    const capacityMW = project.capacity || (project.area / 2);
    
    // Average capacity factor for solar PV (varies by location)
    const capacityFactors = {
      desert: 0.25,
      tropical: 0.18,
      temperate: 0.15,
      cloudy: 0.10,
      default: 0.17
    };
    
    // Determine region and get appropriate capacity factor
    const region = this.determineRegion(project.location) || 'default';
    const capacityFactor = capacityFactors[region] || capacityFactors.default;
    
    // Grid emission factors (tons CO2 per MWh) - varies by region
    const gridEmissionFactors = {
      coal_dominant: 0.9,
      mixed: 0.5,
      gas_dominant: 0.4,
      low_carbon: 0.2,
      default: 0.5
    };
    
    // Determine grid type based on location or use default
    const gridType = this.determineGridType(project.location) || 'default';
    const gridEmissionFactor = gridEmissionFactors[gridType] || gridEmissionFactors.default;
    
    // Annual generation (MWh) = capacity (MW) * capacity factor * hours in year
    const annualGenerationMWh = capacityMW * capacityFactor * 8760;
    
    // Annual emissions reduction = generation * grid emission factor
    const annualEmissionsReduction = annualGenerationMWh * gridEmissionFactor;
    
    // Total credits over project lifetime with a 5% buffer
    const bufferPercentage = 0.05;
    const totalCredits = annualEmissionsReduction * duration * (1 - bufferPercentage);
    
    return Math.round(totalCredits);
  },

  /**
   * Calculate carbon credits for wind energy projects
   * @param {Object} project - The project object
   * @param {number} duration - Project duration in years
   * @returns {number} - Calculated carbon credits
   */
  calculateWindCredits(project, duration) {
    // Estimate system capacity if not explicitly provided
    // Typical wind farm: 1 MW requires ~0.3 hectares of land (more spread out than solar)
    const capacityMW = project.capacity || (project.area / 0.3);
    
    // Average capacity factor for wind (varies by location)
    const capacityFactors = {
      offshore: 0.45,
      coastal: 0.35,
      plains: 0.30,
      inland: 0.25,
      default: 0.30
    };
    
    // Determine region and get appropriate capacity factor
    const region = this.determineRegionWind(project.location) || 'default';
    const capacityFactor = capacityFactors[region] || capacityFactors.default;
    
    // Grid emission factors (tons CO2 per MWh) - same as solar
    const gridEmissionFactors = {
      coal_dominant: 0.9,
      mixed: 0.5,
      gas_dominant: 0.4,
      low_carbon: 0.2,
      default: 0.5
    };
    
    // Determine grid type based on location or use default
    const gridType = this.determineGridType(project.location) || 'default';
    const gridEmissionFactor = gridEmissionFactors[gridType] || gridEmissionFactors.default;
    
    // Annual generation (MWh) = capacity (MW) * capacity factor * hours in year
    const annualGenerationMWh = capacityMW * capacityFactor * 8760;
    
    // Annual emissions reduction = generation * grid emission factor
    const annualEmissionsReduction = annualGenerationMWh * gridEmissionFactor;
    
    // Total credits over project lifetime with a 5% buffer
    const bufferPercentage = 0.05;
    const totalCredits = annualEmissionsReduction * duration * (1 - bufferPercentage);
    
    return Math.round(totalCredits);
  },

  /**
   * Calculate carbon credits for conservation projects
   * @param {Object} project - The project object
   * @param {number} duration - Project duration in years
   * @returns {number} - Calculated carbon credits
   */
  calculateConservationCredits(project, duration) {
    // Carbon stocks per hectare based on ecosystem type (tons CO2 per hectare)
    const carbonStocks = {
      tropical_rainforest: 400,
      temperate_forest: 250,
      boreal_forest: 300,
      mangrove: 500,
      peatland: 700,
      grassland: 80,
      default: 250
    };
    
    // Deforestation rates (% of forest lost per year)
    const deforestationRates = {
      high_threat: 0.02, // 2% per year
      medium_threat: 0.01, // 1% per year
      low_threat: 0.005, // 0.5% per year
      default: 0.01
    };
    
    // Determine ecosystem type and threat level
    const ecosystemType = this.determineEcosystemType(project) || 'default';
    const threatLevel = project.threatLevel || 'default';
    
    // Get carbon stock and deforestation rate
    const carbonStock = carbonStocks[ecosystemType] || carbonStocks.default;
    const deforestationRate = deforestationRates[threatLevel] || deforestationRates.default;
    
    // Emissions avoided = area * carbon stock * deforestation rate * years
    // Apply a 30% buffer for uncertainty and leakage
    const bufferPercentage = 0.3;
    const totalEmissionsAvoided = project.area * carbonStock * deforestationRate * duration;
    const creditableEmissions = totalEmissionsAvoided * (1 - bufferPercentage);
    
    return Math.round(creditableEmissions);
  },

  /**
   * Calculate carbon credits for methane capture projects
   * @param {Object} project - The project object
   * @param {number} duration - Project duration in years
   * @returns {number} - Calculated carbon credits
   */
  calculateMethaneCaptureCredits(project, duration) {
    // Methane capture can come from different sources with different rates
    const methaneSourceRates = {
      landfill: 120, // tons CH4 per hectare per year for landfill
      livestock: 50, // tons CH4 per facility per year for livestock waste
      wastewater: 80, // tons CH4 per facility per year for wastewater
      coal_mine: 200, // tons CH4 per mine per year
      default: 100
    };
    
    // Global Warming Potential of methane (CO2 equivalent)
    // IPCC AR5 value: 1 ton CH4 = 28 tons CO2 equivalent
    const gwpMethane = 28;
    
    // Determine source type
    const sourceType = project.methaneSourceType || 'default';
    
    // For area-based sources (like landfills)
    let annualMethaneCapture;
    if (sourceType === 'landfill') {
      annualMethaneCapture = methaneSourceRates[sourceType] * project.area;
    } else {
      // For facility-based sources (using project size as proxy for facility count)
      const facilityCount = project.facilityCount || 1;
      annualMethaneCapture = methaneSourceRates[sourceType] * facilityCount;
    }
    
    // Capture efficiency (not all methane is captured)
    const captureEfficiency = project.captureEfficiency || 0.7; // default 70%
    
    // Calculate CO2-equivalent emissions reduction
    const annualEmissionsReduction = annualMethaneCapture * captureEfficiency * gwpMethane;
    
    // Total over project lifetime with 10% buffer
    const bufferPercentage = 0.1;
    const totalCredits = annualEmissionsReduction * duration * (1 - bufferPercentage);
    
    return Math.round(totalCredits);
  },

  /**
   * Calculate carbon credits for energy efficiency projects
   * @param {Object} project - The project object
   * @param {number} duration - Project duration in years
   * @returns {number} - Calculated carbon credits
   */
  calculateEnergyEfficiencyCredits(project, duration) {
    // Energy saved depends on the type of efficiency project
    // Values in MWh per year per project unit
    const efficiencyTypes = {
      industrial: 2000, // MWh per facility
      commercial: 500, // MWh per building
      residential: 5, // MWh per household
      default: 500
    };
    
    // Grid emission factors (tons CO2 per MWh) - varies by region
    const gridEmissionFactors = {
      coal_dominant: 0.9,
      mixed: 0.5,
      gas_dominant: 0.4,
      low_carbon: 0.2,
      default: 0.5
    };
    
    // Determine efficiency type and grid type
    const efficiencyType = project.efficiencyType || 'default';
    const gridType = this.determineGridType(project.location) || 'default';
    
    // Get baseline values
    const energySaving = efficiencyTypes[efficiencyType];
    const gridEmissionFactor = gridEmissionFactors[gridType];
    
    // Calculate based on project scale
    let totalUnits;
    if (efficiencyType === 'residential') {
      totalUnits = project.households || 100; // default to 100 households
    } else if (efficiencyType === 'commercial') {
      totalUnits = project.buildings || (project.area / 0.1); // rough estimate: 1 building per 0.1 hectare
    } else {
      totalUnits = project.facilities || 1; // default to 1 industrial facility
    }
    
    // Annual emissions reduction
    const annualEmissionsReduction = energySaving * totalUnits * gridEmissionFactor;
    
    // Total over project lifetime with 15% buffer for rebound effects
    const bufferPercentage = 0.15;
    const totalCredits = annualEmissionsReduction * duration * (1 - bufferPercentage);
    
    return Math.round(totalCredits);
  },

  /**
   * Calculate carbon credits for biomass projects
   * @param {Object} project - The project object
   * @param {number} duration - Project duration in years
   * @returns {number} - Calculated carbon credits
   */
  calculateBiomassCredits(project, duration) {
    // Biomass can be used in various ways with different emission reductions
    const biomassTypes = {
      power_generation: 0.8, // tons CO2 per MWh compared to fossil fuel
      heating: 0.6, // tons CO2 per MWh for heating
      cooking: 0.4, // tons CO2 per household
      default: 0.5
    };
    
    // Determine biomass type
    const biomassType = project.biomassType || 'default';
    const emissionFactor = biomassTypes[biomassType];
    
    let annualEmissionsReduction;
    
    if (biomassType === 'power_generation') {
      // Capacity in MW, estimated from area if not provided
      const capacityMW = project.capacity || (project.area * 0.5);
      const capacityFactor = 0.7; // typical for biomass plants
      const annualGenerationMWh = capacityMW * capacityFactor * 8760;
      annualEmissionsReduction = annualGenerationMWh * emissionFactor;
    } else if (biomassType === 'heating') {
      const heatOutputMWh = project.heatOutput || (project.area * 100);
      annualEmissionsReduction = heatOutputMWh * emissionFactor;
    } else {
      // Cooking applications - based on households
      const households = project.households || 1000;
      annualEmissionsReduction = households * emissionFactor;
    }
    
    // Sustainability factor - reduces credits if biomass source is not sustainable
    const sustainabilityFactor = project.sustainablySourced ? 1.0 : 0.5;
    
    // Total over project lifetime with 10% buffer
    const bufferPercentage = 0.1;
    const totalCredits = annualEmissionsReduction * duration * sustainabilityFactor * (1 - bufferPercentage);
    
    return Math.round(totalCredits);
  },

  /**
   * Helper method to determine region based on project location
   * @param {string} location - Project location
   * @returns {string} - Region classification
   */
  determineRegion(location = '') {
    if (!location) return 'default';
    
    const locationLower = location.toLowerCase();
    
    if (locationLower.includes('tropic') || 
        locationLower.includes('amazon') || 
        locationLower.includes('congo') || 
        locationLower.includes('indonesia') ||
        locationLower.includes('kenya') || 
        locationLower.includes('brazil') ||
        locationLower.includes('equator')) {
      return 'tropical';
    }
    
    if (locationLower.includes('temperate') || 
        locationLower.includes('europe') || 
        locationLower.includes('china') || 
        locationLower.includes('usa') ||
        locationLower.includes('australia')) {
      return 'temperate';
    }
    
    if (locationLower.includes('boreal') || 
        locationLower.includes('canada') || 
        locationLower.includes('russia') || 
        locationLower.includes('sweden') ||
        locationLower.includes('finland') || 
        locationLower.includes('norway')) {
      return 'boreal';
    }
    
    if (locationLower.includes('desert') || 
        locationLower.includes('sahara') || 
        locationLower.includes('mojave') || 
        locationLower.includes('gobi')) {
      return 'desert';
    }
    
    return 'default';
  },

  /**
   * Helper method to determine wind region based on project location
   * @param {string} location - Project location
   * @returns {string} - Wind region classification
   */
  determineRegionWind(location = '') {
    if (!location) return 'default';
    
    const locationLower = location.toLowerCase();
    
    if (locationLower.includes('offshore') || 
        locationLower.includes('sea') || 
        locationLower.includes('ocean')) {
      return 'offshore';
    }
    
    if (locationLower.includes('coast') || 
        locationLower.includes('shore') || 
        locationLower.includes('beach')) {
      return 'coastal';
    }
    
    if (locationLower.includes('plain') || 
        locationLower.includes('grassland') || 
        locationLower.includes('steppe') ||
        locationLower.includes('prairie')) {
      return 'plains';
    }
    
    return 'inland';
  },

  /**
   * Helper method to determine grid type based on project location
   * @param {string} location - Project location
   * @returns {string} - Grid type classification
   */
  determineGridType(location = '') {
    if (!location) return 'default';
    
    const locationLower = location.toLowerCase();
    
    // Coal dominant regions
    if (locationLower.includes('china') || 
        locationLower.includes('india') || 
        locationLower.includes('poland') ||
        locationLower.includes('south africa') || 
        locationLower.includes('australia')) {
      return 'coal_dominant';
    }
    
    // Gas dominant regions
    if (locationLower.includes('united states') || 
        locationLower.includes('usa') || 
        locationLower.includes('russia') ||
        locationLower.includes('qatar') || 
        locationLower.includes('middle east')) {
      return 'gas_dominant';
    }
    
    // Low carbon regions
    if (locationLower.includes('france') || 
        locationLower.includes('sweden') || 
        locationLower.includes('norway') ||
        locationLower.includes('costa rica') || 
        locationLower.includes('switzerland') ||
        locationLower.includes('iceland')) {
      return 'low_carbon';
    }
    
    return 'mixed';
  },

  /**
   * Helper method to determine ecosystem type based on project
   * @param {Object} project - The project object
   * @returns {string} - Ecosystem type
   */
  determineEcosystemType(project) {
    if (!project || !project.location) return 'default';
    
    const locationLower = project.location.toLowerCase();
    const description = (project.description || '').toLowerCase();
    
    // Check if ecosystem type is explicitly specified
    if (project.ecosystemType) {
      return project.ecosystemType;
    }
    
    // Try to determine from location and description
    if ((locationLower.includes('tropical') || description.includes('tropical')) && 
        (locationLower.includes('forest') || description.includes('forest') || 
         locationLower.includes('rainforest') || description.includes('rainforest'))) {
      return 'tropical_rainforest';
    }
    
    if ((locationLower.includes('temperate') || description.includes('temperate')) && 
        (locationLower.includes('forest') || description.includes('forest'))) {
      return 'temperate_forest';
    }
    
    if ((locationLower.includes('boreal') || description.includes('boreal') || 
         locationLower.includes('taiga') || description.includes('taiga')) && 
        (locationLower.includes('forest') || description.includes('forest'))) {
      return 'boreal_forest';
    }
    
    if (locationLower.includes('mangrove') || description.includes('mangrove')) {
      return 'mangrove';
    }
    
    if (locationLower.includes('peat') || description.includes('peat')) {
      return 'peatland';
    }
    
    if (locationLower.includes('grass') || description.includes('grass') ||
        locationLower.includes('savanna') || description.includes('savanna')) {
      return 'grassland';
    }
    
    return 'default';
  }
};

export default carbonCalculationService;