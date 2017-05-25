const columnMaps = {
  'asset-types': { 
    map: {
      code:      0, 
      name:      1, 
      operation: 2
    }
  },
  'account-types': { 
    map: {
      code:                   0, 
      name:                   1,
      isIncludedInDataExport: 2,
      unitsType:              3,
      units:                  4,
      operation:              5
    }
  },
  accounts: { 
    map: {
      name:                          0,
      parentName:                    1,
      accountTypeCode:               2,
      defaultRepeatFrequency:        3,
      accountNameUsedForRepeatSpend: 4,
      rollupChildAccoutsForTransfer: 5,
      accountNamePerCostModel:       6,
      operation:                     7
    }
  },
  facilities: { 
    map: {
      code:                           0,
      name:                           1,
      parentFacilityCode:             2,
      defaultAutomaticSchemeTypeCode: 3,
      defaultManualSchemeTypeCode:    4,
      facilityTypeCode:               5,
      siteType:                       6,
      tariffType:                     7,
      operation:                      8
    }
  },

};

module.exports = columnMaps;
