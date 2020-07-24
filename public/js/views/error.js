// First-layer pass: Must Pass before further validation
var blankInput = "You have element without inputing any terms.";
var irrelevantTerm = " is irrelevant or incorrect.   ";
var standAlone ="Your solution has an island element that is not connected to any other elements.";
var noTarget = " has a link without target element.";
// Second-layer pass: Root entity must correctly exist before further validation
var emptyGraph = "No elements is detected in your solution.";
var missRootEntity ="Your solution is missing the very essential/root entity. It must exist for further evaluation. ";
var missWeakEnti = "Your solution is missing one or more weak entity.";
var missEntity = "Your solution is missing one or more entity. ";
var incrtType = " is placed under an incorrect element type.   "; // term placed under incorrect type
var repeatedTerm = " should not have repeated features or relationships.";
var missAttr = " is missing some attribute(s).  ";
var missKey = " is missing one or more identifying Key features.  ";
var missDeri = " is missing some Derived(s).  ";
var overKey = " is connected with more Key features than it should have. ";
var overAttr = " is connected with more Attributes than it should have. ";
var overDeri =" is connected with more Derived attributes than it should have. ";
var incrtKeyOwner = " does not belong to its connected entity.";
var keyOwners =" should not connect to multiple elements. One key should only belong to one (weak)entity. ";
var attrOwners =" should not connect to multiple elements. One attribute should only belong to one element. ";
var deriOwners =" should not connect to multiple elements. One Derived attribute should only belong to one element. ";
var incrtAttrOwner = " does not belong to its connected element.";
var incrtCompOwner = " does not belong to its connected element.";
var incrtDeriOwner = " does not belong to its connected element.";
var incrtRelaConnect =" can only connect with entity elements and/or its attribute like all Relationship elements.";
var incrtRelaOwner =" does not belong/relate to one or more of its connected entity.";
var relaNoAttr = " should not have any attributes.";
var missRela = " is missing its Relational element. ";
var overRela =" is connected with more Relational elements than it should have. ";
var noError = "Your solution is perfectly fine. Congratulations!";
var incrtEntiConnect =" can only connect with its features and/or Relationship elements. Entity must not directly connect with other (Weak)Entity.";
var incrtIdenRelaOwner =" does not belong/relate to one or more of its connected entity.";
var missIdRela = " is missing its Identifying Relational element. ";
var overIdRela =" is connected with more Identifying Relational elements than it should have. ";
var IdRelaNoAttr = " should not have any attributes.";
var relaMissAttr = " is missing its attribute. ";
var incrtIdenRelaConnect =" can only connect with weak entity elements and/or its attribute like all Identifying Relationship elements.";
var incrtWeakEntiConnect = " can only connect with its features. Weak Entity must not directly connect with other (Weak)Entity, Relationship or Identifying Relationship elements.";
var missCompo = " is missing one or more component(s).";
var overCompo = " is connected with more components than it should have.";
