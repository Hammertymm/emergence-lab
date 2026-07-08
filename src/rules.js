export const RULES = {
  Life: { birth:[3], survive:[2,3], code:'B3/S23' },
  HighLife: { birth:[3,6], survive:[2,3], code:'B36/S23' },
  Seeds: { birth:[2], survive:[], code:'B2/S' },
  Maze: { birth:[3], survive:[1,2,3,4,5], code:'B3/S12345' },
  Coral: { birth:[3], survive:[4,5,6,7,8], code:'B3/S45678' },
  DayNight: { birth:[3,6,7,8], survive:[3,4,6,7,8], code:'B3678/S34678' }
};
