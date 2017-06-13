const CONSTANTS = require('../constants');
const GenericUpdate = require('./generic-update');

class FamilyUpdate extends GenericUpdate {

  static setQueryFindJoin(context, update, criteria) {
    Utils.leftJoinGenerationsDownwards(context.queryFind);
    Utils.leftJoinGenotypesDownwards(context.queryFind);
    Utils.leftJoinPlantsDownwards(context.queryFind);
  }

}

FamilyUpdate.TABLE = CONSTANTS.TABLE_FAMILIES;
FamilyUpdate.ID_FIELD = CONSTANTS.
