var App = window.App || {};
var graph = new joint.dia.Graph();
// (function (_, joint) {
function main(_, joint) {
  // 'use strict';
  App.MainView = joint.mvc.View.extend({
    className: "app",
    events: {
      'mouseup input[type="range"]': "removeTargetFocus",
      mousedown: "removeFocus",
      touchstart: "removeFocus",
    },

    removeTargetFocus: function (evt) {
      evt.target.blur();
    },

    removeFocus: function (evt) {
      // do not lose focus on right-click
      if (evt.button === 2) return;

      // do not lose focus if clicking current element for a second time
      var activeElement = document.activeElement;
      var target = evt.target;
      if ($.contains(activeElement, target) || activeElement === target) return;

      activeElement.blur();
      window.getSelection().removeAllRanges();
    },

    init: function () {
      this.initializePaper();
      this.initializeStencil();
      this.initializeSelection();
      this.initializeToolsAndInspector();
      this.initializeNavigator();
      this.initializeToolbar();
      this.initializeKeyboardShortcuts();
      this.initializeTooltips();
    },

    // Create a graph, paper and wrap the paper in a PaperScroller.
    initializePaper: function () {
      // var graph = this.graph = new joint.dia.Graph;
      this.graph = graph;
      this.graph.on(
        "add",
        function (cell, collection, opt) {
          if (opt.stencil) this.createInspector(cell);
        },
        this
      );

      this.commandManager = new joint.dia.CommandManager({ graph: graph });
      // graphMani = JSON.stringify(this.graph.toJSON());

      var paper = (this.paper = new joint.dia.Paper({
        width: 900,
        height: 700,
        gridSize: 10,
        drawGrid: true,
        model: graph,
        defaultLink: new joint.shapes.app.Link(),
        defaultConnectionPoint: joint.shapes.app.Link.connectionPoint,
        interactive: { linkMove: false },
        async: true,
        sorting: joint.dia.Paper.sorting.APPROX,
      }));

      paper.on("blank:mousewheel", _.partial(this.onMousewheel, null), this);
      paper.on("cell:mousewheel", this.onMousewheel, this);

      this.snaplines = new joint.ui.Snaplines({ paper: paper });

      var paperScroller = (this.paperScroller = new joint.ui.PaperScroller({
        paper: paper,
        autoResizePaper: true,
        cursor: "grab",
      }));

      this.$(".paper-container").append(paperScroller.el);
      paperScroller.render().center();
    },

    // Create and populate stencil.
    initializeStencil: function () {
      var stencil = (this.stencil = new joint.ui.Stencil({
        paper: this.paperScroller,
        snaplines: this.snaplines,
        scaleClones: true,
        width: 200,
        groups: App.config.stencil.groups,
        dropAnimation: true,
        groupsToggleButtons: true,
        search: {
          "*": [
            "type",
            "attrs/text/text",
            "attrs/root/dataTooltip",
            "attrs/label/text",
          ],
          "org.Member": [
            "attrs/.rank/text",
            "attrs/root/dataTooltip",
            "attrs/.name/text",
          ],
        },
        // Use default Grid Layout
        layout: true,
        // Remove tooltip definition from clone
        dragStartClone: function (cell) {
          return cell.clone().removeAttr("root/dataTooltip");
        },
      }));

      this.$(".stencil-container").append(stencil.el);
      stencil.render().load(App.config.stencil.shapes);
    },

    initializeKeyboardShortcuts: function () {
      this.keyboard = new joint.ui.Keyboard();
      this.keyboard.on(
        {
          "ctrl+c": function () {
            // Copy all selected elements and their associated links.
            this.clipboard.copyElements(this.selection.collection, this.graph);
          },

          "ctrl+v": function () {
            var pastedCells = this.clipboard.pasteCells(this.graph, {
              translate: { dx: 20, dy: 20 },
              useLocalStorage: true,
            });

            var elements = _.filter(pastedCells, function (cell) {
              return cell.isElement();
            });

            // Make sure pasted elements get selected immediately. This makes the UX better as
            // the user can immediately manipulate the pasted elements.
            this.selection.collection.reset(elements);
          },

          "ctrl+x shift+delete": function () {
            this.clipboard.cutElements(this.selection.collection, this.graph);
          },

          "delete backspace": function (evt) {
            evt.preventDefault();
            this.graph.removeCells(this.selection.collection.toArray());
          },

          "ctrl+z": function () {
            this.commandManager.undo();
            this.selection.cancelSelection();
          },

          "ctrl+y": function () {
            this.commandManager.redo();
            this.selection.cancelSelection();
          },

          "ctrl+a": function () {
            this.selection.collection.reset(this.graph.getElements());
          },

          "ctrl+plus": function (evt) {
            evt.preventDefault();
            this.paperScroller.zoom(0.2, { max: 5, grid: 0.2 });
          },

          "ctrl+minus": function (evt) {
            evt.preventDefault();
            this.paperScroller.zoom(-0.2, { min: 0.2, grid: 0.2 });
          },

          "keydown:shift": function (evt) {
            this.paperScroller.setCursor("crosshair");
          },

          "keyup:shift": function () {
            this.paperScroller.setCursor("grab");
          },
        },
        this
      );
    },

    initializeSelection: function () {
      this.clipboard = new joint.ui.Clipboard();
      this.selection = new joint.ui.Selection({
        paper: this.paper,
        handles: App.config.selection.handles,
        useModelGeometry: true,
      });

      this.selection.collection.on(
        "reset add remove",
        this.onSelectionChange.bind(this)
      );

      // Initiate selecting when the user grabs the blank area
      // of the paper while the Shift key is pressed.
      // Otherwise, initiate paper pan.
      this.paper.on(
        "blank:pointerdown",
        function (evt, x, y) {
          if (this.keyboard.isActive("shift", evt)) {
            this.selection.startSelecting(evt);
          } else {
            this.selection.collection.reset([]);
            this.paperScroller.startPanning(evt, x, y);
            this.paper.removeTools();
          }
        },
        this
      );

      this.paper.on(
        "element:pointerdown",
        function (elementView, evt) {
          // Select an element if CTRL/Meta key is pressed while the element is clicked.
          if (this.keyboard.isActive("ctrl meta", evt)) {
            if (
              this.selection.collection.find(function (cell) {
                return cell.isLink();
              })
            ) {
              // Do not allow mixing links and elements in the selection
              this.selection.collection.reset([elementView.model]);
            } else {
              this.selection.collection.add(elementView.model);
            }
          }
        },
        this
      );

      this.selection.on(
        "selection-box:pointerdown",
        function (elementView, evt) {
          // Unselect an element if the CTRL/Meta key is pressed while a selected element is clicked.
          if (this.keyboard.isActive("ctrl meta", evt)) {
            evt.preventDefault();
            this.selection.collection.remove(elementView.model);
          }
        },
        this
      );
    },

    onSelectionChange: function () {
      var paper = this.paper;
      var selection = this.selection;
      var collection = selection.collection;
      paper.removeTools();
      joint.ui.Halo.clear(paper);
      joint.ui.FreeTransform.clear(paper);
      joint.ui.Inspector.close();
      if (collection.length === 1) {
        var primaryCell = collection.first();
        var primaryCellView = paper.requireView(primaryCell);
        selection.destroySelectionBox(primaryCell);
        this.selectPrimaryCell(primaryCellView);
      } else if (collection.length === 2) {
        collection.each(function (cell) {
          selection.createSelectionBox(cell);
        });
      }
    },

    selectPrimaryCell: function (cellView) {
      var cell = cellView.model;
      if (cell.isElement()) {
        this.selectPrimaryElement(cellView);
      } else {
        this.selectPrimaryLink(cellView);
      }
      this.createInspector(cell);
    },

    selectPrimaryElement: function (elementView) {
      var element = elementView.model;

      new joint.ui.FreeTransform({
        cellView: elementView,
        allowRotation: false,
        preserveAspectRatio: !!element.get("preserveAspectRatio"),
        allowOrthogonalResize: element.get("allowOrthogonalResize") !== false,
      }).render();

      new joint.ui.Halo({
        cellView: elementView,
        handles: App.config.halo.handles,
      }).render();
    },

    selectPrimaryLink: function (linkView) {
      var ns = joint.linkTools;
      var toolsView = new joint.dia.ToolsView({
        name: "link-pointerdown",
        tools: [
          new ns.Vertices(),
          new ns.SourceAnchor(),
          new ns.TargetAnchor(),
          new ns.SourceArrowhead(),
          new ns.TargetArrowhead(),
          new ns.Segments(),
          new ns.Boundary({ padding: 15 }),
          new ns.Remove({ offset: -20, distance: 40 }),
        ],
      });

      linkView.addTools(toolsView);
    },

    createInspector: function (cell) {
      return joint.ui.Inspector.create(
        ".inspector-container",
        _.extend(
          {
            cell: cell,
          },
          App.config.inspector[cell.get("type")]
        )
      );
    },

    initializeToolsAndInspector: function () {
      this.paper.on(
        {
          "cell:pointerup": function (cellView) {
            var cell = cellView.model;
            var collection = this.selection.collection;
            if (collection.includes(cell)) return;
            collection.reset([cell]);
          },

          "link:mouseenter": function (linkView) {
            // Open tool only if there is none yet
            if (linkView.hasTools()) return;

            var ns = joint.linkTools;
            var toolsView = new joint.dia.ToolsView({
              name: "link-hover",
              tools: [
                new ns.Vertices({ vertexAdding: false }),
                new ns.SourceArrowhead(),
                new ns.TargetArrowhead(),
              ],
            });

            linkView.addTools(toolsView);
          },

          "link:mouseleave": function (linkView) {
            // Remove only the hover tool, not the pointerdown tool
            if (linkView.hasTools("link-hover")) {
              linkView.removeTools();
            }
          },
        },
        this
      );

      this.graph.on(
        "change",
        function (cell, opt) {
          if (!cell.isLink() || !opt.inspector) return;

          var ns = joint.linkTools;
          var toolsView = new joint.dia.ToolsView({
            name: "link-inspected",
            tools: [new ns.Boundary({ padding: 15 })],
          });

          cell.findView(this.paper).addTools(toolsView);
        },
        this
      );
    },

    initializeNavigator: function () {
      var navigator = (this.navigator = new joint.ui.Navigator({
        width: 240,
        height: 115,
        paperScroller: this.paperScroller,
        zoom: {
          grid: 0.2,
          min: 0.2,
          max: 5,
        },
        paperOptions: {
          async: true,
          elementView: joint.shapes.app.NavigatorElementView,
          linkView: joint.shapes.app.NavigatorLinkView,
          cellViewNamespace: {
            /* no other views are accessible in the navigator */
          },
        },
      }));

      this.$(".navigator-container").append(navigator.el);
      navigator.render();
    },

    initializeToolbar: function () {
      var toolbar = (this.toolbar = new joint.ui.Toolbar({
        autoToggle: true,
        groups: App.config.toolbar.groups,
        tools: App.config.toolbar.tools,
        references: {
          paperScroller: this.paperScroller,
          commandManager: this.commandManager,
        },
      }));

      toolbar.on({
        "svg:pointerclick": this.openAsSVG.bind(this),
        "png:pointerclick": this.openAsPNG.bind(this),
        "to-front:pointerclick": this.applyOnSelection.bind(this, "toFront"),
        "to-back:pointerclick": this.applyOnSelection.bind(this, "toBack"),
        "layout:pointerclick": this.layoutDirectedGraph.bind(this),
        "snapline:change": this.changeSnapLines.bind(this),
        "clear:pointerclick": this.graph.clear.bind(this.graph),
        "print:pointerclick": this.paper.print.bind(this.paper),
        "grid-size:change": this.paper.setGridSize.bind(this.paper),
      });

      this.$(".toolbar-container").append(toolbar.el);
      toolbar.render();
    },

    applyOnSelection: function (method) {
      this.graph.startBatch("selection");
      this.selection.collection.models.forEach(function (model) {
        model[method]();
      });
      this.graph.stopBatch("selection");
    },

    changeSnapLines: function (checked) {
      if (checked) {
        this.snaplines.startListening();
        this.stencil.options.snaplines = this.snaplines;
      } else {
        this.snaplines.stopListening();
        this.stencil.options.snaplines = null;
      }
    },

    initializeTooltips: function () {
      new joint.ui.Tooltip({
        rootTarget: document.body,
        target: "[data-tooltip]",
        direction: "auto",
        padding: 10,
        animation: true,
      });
    },

    // backwards compatibility for older shapes
    exportStylesheet: ".scalable * { vector-effect: non-scaling-stroke }",

    openAsSVG: function () {
      var paper = this.paper;
      paper.hideTools().toSVG(
        function (svg) {
          new joint.ui.Lightbox({
            image: "data:image/svg+xml," + encodeURIComponent(svg),
            downloadable: true,
            fileName: "Rappid",
          }).open();
          paper.showTools();
        },
        {
          preserveDimensions: true,
          convertImagesToDataUris: true,
          useComputedStyles: false,
          stylesheet: this.exportStylesheet,
        }
      );
    },

    openAsPNG: function () {
      var paper = this.paper;
      paper.hideTools().toPNG(
        function (dataURL) {
          new joint.ui.Lightbox({
            image: dataURL,
            downloadable: true,
            fileName: "Rappid",
          }).open();
          paper.showTools();
        },
        {
          padding: 10,
          useComputedStyles: false,
          stylesheet: this.exportStylesheet,
        }
      );
    },

    onMousewheel: function (cellView, evt, x, y, delta) {
      if (this.keyboard.isActive("alt", evt)) {
        evt.preventDefault();
        this.paperScroller.zoom(delta * 0.2, {
          min: 0.2,
          max: 5,
          grid: 0.2,
          ox: x,
          oy: y,
        });
      }
    },

    layoutDirectedGraph: function () {
      joint.layout.DirectedGraph.layout(this.graph, {
        setLinkVertices: true,
        rankDir: "TB",
        marginX: 100,
        marginY: 100,
      });

      this.paperScroller.centerContent();
    },
  });
}
// })(_, joint);

var marks = 0, weakEntNum = 0, entiNum = 0; // total marks 100; record weak entity and entity number in the diagram
var numErr = 0, answers = document.createElement("P"), numErrs = document.createElement("P"); // record error number and corresponding feedback answer
var removedLinks = []; // store the links removed in validation process, for adding back once validation done
var terms, entArr; // datasets of the current problem

function validation() {

  // evaluation start here
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      terms = datasets[problemIndex][0];
      entArr = datasets[problemIndex][1];
      var graphMani = graph.getElements(); // Get all elements to manipulate

      answers.textContent = "";  // reset global var for every new evaluation

      numErrs.textContent = "";
      numErr = entiNum = weakEntNum = marks = 0;
      // entiNum = 0; 
      var entIndex = 0,
        termsUsed = [],
        haveRoot = firstPass = false;
      /* General Pass Must Be Passed To Proceed */
      if(graphMani.length == 0)
        answers.textContent += ++numErr + ". " + emptyGraph;
      for (let key in graphMani) {
        // run through every element
        termsUsed[key] = graphMani[key].prop("attrs/text/text"); // store used terms for validation
        if (termsUsed[key] == "") {
          answers.textContent += ++numErr + ". " + blankInput;
        } else {
          var temp = termCheck(termsUsed[key], terms);
          if (temp < 0) {
            // irrelevant terms selected
            answers.textContent +=
              ++numErr +
              ". The input term: [" +
              termsUsed[key] +
              "]" +
              irrelevantTerm;
          } else {
            // standardize the input term if its deemed correct
            termsUsed[key] = terms[temp];
            graphMani[key].attr("text/text", terms[temp]);
          }
        }
        if (graph.getNeighbors(graphMani[key]).length == 0)
          // Element w/o connecting to others
          answers.textContent += ++numErr + ". " + standAlone;
      }

      var links = graph.getLinks();
      for (let key in links) {
        // Find links without target
        var sourceText = graph.getCell(links[key].get("source")).prop("attrs/text/text");
        if (links[key].get("target").id == undefined || links[key].get("source").id == undefined){
          graph.getCell(links[key].id).remove();
          answers.textContent +=
            ++numErr + ". The input term: [" + sourceText + "]" + noTarget;
        }
      }

      /*If General Pass Passed - Root entity has to exist before further validation*/
      if (numErr == 0) {
        firstPass = true;
        marks += 30; // scored 30 marks after general pass passed
        for (let index in termsUsed) {
          // Check if the root entity correctly exists
          if (
            termsUsed[index] == terms[0] &&
            graphMani[index].prop("type") == "erd.Entity"
          ) {
            haveRoot = true;
            entIndex = index; // store entity element index
            break;
          }
        }

        if (haveRoot == false)
          answers.textContent += ++numErr + ". " + missRootEntity;
        // missing root entity
        else entityCheck(graphMani[entIndex]); // validate neighbor elements of the root entity and so on

        if (removedLinks.length != 0) {
          // add back the removed links after validation done
          for (let index in removedLinks) graph.addCell(removedLinks[index]);
        }
      }
      if(weakEntNum < entArr[entArr.length-1].weakEntNum && firstPass == true)
        answers.textContent += ++numErr + ". " + missWeakEnti + '\n';
      if(entiNum < entArr[entArr.length-1].entityNum && firstPass == true)
        answers.textContent += ++numErr  + ". "+ missEntity+'\n';

      if (numErr == 0 && firstPass == true)
      { answers.textContent += noError; // no error found
        numErrs.textContent += "Your diagram is scored 100 marks.";
      }
      else if(numErr > 0 && numErr < 3 && firstPass == true){
        marks += 50;
        numErrs.textContent += "Your diagram is scored " + marks  + " marks.";
      }else if(numErr >= 3 && numErr <= 5 && firstPass == true){
        marks += 30;
        numErrs.textContent += "Your diagram is scored " + marks +  " marks.";
      }else{
        numErrs.textContent += "Your diagram is scored " + marks + " marks.";
      }
      document.getElementById("answerContent").insertBefore(numErrs, null);
      document.getElementById("answerContent").appendChild(answers);
    }
  };
  // before modification
  // xhttp.open("GET", "/dashboard", true);
  // xhttp.send();

  // after modification
  xhttp.open("POST", "/dashboard", true);
  var diagramJsonString = JSON.stringify(graph.toJSON());
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(diagramJsonString);
}

function cleanCanvas() {
  graph.clear();
}

// get history
function getRecord() {
  // get record
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      graph.clear();

      if (this.responseText == "") {
        alert("Can Not Find History 1!");
      } else {
        graph.fromJSON(JSON.parse(this.responseText));
      }
    }
  };
  xhttp.open("GET", "/history", true);
  xhttp.send();
}
// get history2
function getRecord2() {
  // get record
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      graph.clear();
      if (this.responseText == "") {
        alert("Can Not Find History 2!");
      } else {
        graph.fromJSON(JSON.parse(this.responseText));
      }
    }
  };
  xhttp.open("GET", "/history2", true);
  xhttp.send();
}
// get history3
function getRecord3() {
  // get record
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      graph.clear();
      if (this.responseText == "") {
        alert("Can Not Find History 3!");
      } else {
        graph.fromJSON(JSON.parse(this.responseText));
      }
    }
  };
  xhttp.open("GET", "/history3", true);
  xhttp.send();
}
// get history4
function getRecord4() {
  // get record
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      graph.clear();
      if (this.responseText == "") {
        alert("Can Not Find History 4!");
      } else {
        graph.fromJSON(JSON.parse(this.responseText));
      }
    }
  };
  xhttp.open("GET", "/history4", true);
  xhttp.send();
}

// get history5
function getRecord5() {
  // get record
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      graph.clear();

      if (this.responseText == "") {
        alert("Can Not Find History 5!");
      } else {
        graph.fromJSON(JSON.parse(this.responseText));
      }
    }
  };
  xhttp.open("GET", "/history5", true);
  xhttp.send();
}

// get history5
function cleanAll() {
  // get record
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      // graph.clear();

      alert("Historys are all cleaned up!");

      // graph.fromJSON(JSON.parse(this.responseText));
    }
  };
  xhttp.open("GET", "/cleanAll", true);
  xhttp.send();
}
// check input term correctness
function termCheck(target, termArr) {
  for (let key in termArr)
    if ( target.toLowerCase() == termArr[key].toLowerCase()
      // target.toLowerCase().includes(termArr[key]) ||
      // termArr[key].includes(target.toLowerCase())
    )
      return key;
  return -1;
}

// remove the link between a Relational/Idenfifying Rela and a new to-check Entity to avoid BFS self-loop
function removeLink(sourceEleText, targetEleText) {
  var allLinks = graph.getLinks();
  for (let key in allLinks) {
    // Find the specific link
    var outText = graph
      .getCell(allLinks[key].get("source"))
      .prop("attrs/text/text");
    var inText = graph
      .getCell(allLinks[key].get("target"))
      .prop("attrs/text/text");
    if (
      (outText == sourceEleText && inText == targetEleText) ||
      (outText == targetEleText && inText == sourceEleText)
    ) {
      removedLinks.push(allLinks[key]); // store for adding back when validation done
      graph.getCell(allLinks[key].id).remove();
    }
  }
}
// check weak entity, quite similar to entity, but with less types of element allowed to connect
function weakEntCheck(entToCheck) {
  /* find the index of the weak entity in problems' dataset array */
  weakEntNum ++;
  var currEntInd;
  for (let index in entArr) {
    if (entToCheck.prop("attrs/text/text") == entArr[index].weakEntiText) {
      currEntInd = index;
      break;
    }
  }
  if (currEntInd == undefined) {
    // If the weak-entity has an incorrect term in it
    answers.textContent +=
      ++numErr +
      ". The term: [" +
      entToCheck.prop("attrs/text/text") +
      "]" +
      incrtType; // not weak-entity
  } else {
    var neighborEle = graph.getNeighbors(entToCheck); // get neighbours of the to-check weak entity
    var repetitionCheck = [];
    var keyNum = 0,
      attrsNum = 0,
      deriNum = 0;

    for (let index in neighborEle) {
      // walk through neighbour elements of this weak entity
      var temp = neighborEle[index];
      var tempNei = graph.getNeighbors(temp);
      // Term repitition check for this entity
      if (repetitionCheck.includes(temp.prop("attrs/text/text")) == false)
        repetitionCheck.push(temp.prop("attrs/text/text"));
      else
        answers.textContent +=
          ++numErr +
          ". The weak entity: [" +
          entArr[currEntInd].weakEntiText +
          "]" +
          repeatedTerm; // repetition error

      // Derived attribute check
      if (temp.prop("type") == "erd.Derived") {
        if (entArr[currEntInd].derisText.length > 0) {
          // if this weak entity has a Derived attribute
          deriNum++;
          if (
            entArr[currEntInd].derisText.includes(
              temp.prop("attrs/text/text")
            ) == true
          ) {
            if (tempNei.length > 1)
              // multiple Derived attribute ownershop error
              answers.textContent +=
                ++numErr +
                ". The Derived attribute: [" +
                temp.prop("attrs/text/text") +
                "]" +
                deriOwners;
          } else {
            // Derived attribute belong to other entity
            answers.textContent +=
              ++numErr +
              ". The Derived attribute: [" +
              temp.prop("attrs/text/text") +
              "]" +
              incrtDeriOwner +
              " Or this term" +
              incrtType;
          }
        } else {
          answers.textContent +=
            ++numErr +
            ". The Derived attribute: [" +
            temp.prop("attrs/text/text") +
            "]" +
            incrtDeriOwner +
            " Or this term " +
            incrtType;
        }
      }
      // key check
      if (temp.prop("type") == "erd.Key") {
        keyNum++;
        if (
          entArr[currEntInd].keysText.includes(temp.prop("attrs/text/text")) ==
          true
        ) {
          if (tempNei.length > 1)
            // multiple key ownershop error
            answers.textContent +=
              ++numErr +
              ". The Key: [" +
              temp.prop("attrs/text/text") +
              "]" +
              keyOwners;
        } else {
          // key belong to other entity
          answers.textContent +=
            ++numErr +
            ". The Key: [" +
            temp.prop("attrs/text/text") +
            "]" +
            incrtKeyOwner +
            " Or this term " +
            incrtType;
        }
      }
      // Attribute&Composite check
      if (temp.prop("type") == "erd.Normal") {
        attrsNum++;
        if (
          entArr[currEntInd].attrsText.includes(temp.prop("attrs/text/text")) ==
          true
        ) {
          if (entArr[currEntInd].composite.length == 0) {
            // if no composite
            if (tempNei.length > 1)
              // multiple attribute ownershop error
              answers.textContent +=
                ++numErr +
                ". The Attribute: [" +
                temp.prop("attrs/text/text") +
                "]" +
                attrOwners;
          } else {
            if (
              temp.prop("attrs/text/text") == entArr[currEntInd].composite[0]
            ) {
              // if composite
              if (tempNei.length > entArr[currEntInd].composite.length) {
                // this attrubite is connected with elements other than components and this weak entity
                answers.textContent +=
                  ++numErr +
                  ". The Attribute composite: [" +
                  temp.prop("attrs/text/text") +
                  "]" +
                  attrOwners +
                  " Or " +
                  overCompo;
              } else if (tempNei.length < entArr[currEntInd].composite.length) {
                // this attribute is not connected with all componets
                answers.textContent +=
                  ++numErr +
                  ". The Attribute composite: [" +
                  temp.prop("attrs/text/text") +
                  "]" +
                  missCompo;
              } else {
                // component check
                for (let indexComp in tempNei) {
                  if (
                    tempNei[indexComp].prop("attrs/text/text") !=
                    entArr[currEntInd].weakEntiText
                  ) {
                    if (
                      entArr[currEntInd].composite.includes(
                        tempNei[indexComp].prop("attrs/text/text")
                      ) == false
                    )
                      answers.textContent +=
                        ++numErr +
                        ". The component: [" +
                        tempNei[indexComp].prop("attrs/text/text") +
                        "]" +
                        incrtCompOwner +
                        " Or this term " +
                        incrtType;
                  }
                }
              }
            } else {
              // if other attributes
              if (tempNei.length > 1)
                answers.textContent +=
                  ++numErr +
                  ". The Attribute: [" +
                  temp.prop("attrs/text/text") +
                  "]" +
                  attrOwners; // multiple attribute ownershop error
            }
          }
        } else {
          // attribute belong to other (weak)entity
          answers.textContent +=
            ++numErr +
            ". The Attribute: [" +
            temp.prop("attrs/text/text") +
            "]" +
            incrtAttrOwner +
            " Or this term " +
            incrtType;
        }
      }
      // incorrect connection wit this weak entity
      if (
        temp.prop("type") == "erd.IdentifyingRelationship" ||
        temp.prop("type") == "erd.WeakEntity" ||
        temp.prop("type") == "erd.Entity" ||
        temp.prop("type") == "erd.Relationship"
      )
        answers.textContent +=
          ++numErr +
          ". The WeakEntity: [" +
          entArr[currEntInd].weakEntiText +
          "]" +
          incrtWeakEntiConnect;
    }
    if (keyNum < entArr[currEntInd].keysText.length)
      answers.textContent +=
        ++numErr +
        ". The Weak Entity: [" +
        entArr[currEntInd].weakEntiText +
        "]" +
        missKey; // missing one or more keys
    if (keyNum > entArr[currEntInd].keysText.length)
      answers.textContent +=
        ++numErr +
        ". The Weak Entity: [" +
        entArr[currEntInd].weakEntiText +
        "]" +
        overKey; // connect too many keys
    if (attrsNum < entArr[currEntInd].attrsText.length)
      answers.textContent +=
        ++numErr +
        ". The Weak Entity: [" +
        entArr[currEntInd].weakEntiText +
        "]" +
        missAttr; // missing one or more attributess
    if (attrsNum > entArr[currEntInd].attrsText.length)
      answers.textContent +=
        ++numErr +
        ". The Weak Entity: [" +
        entArr[currEntInd].weakEntiText +
        "]" +
        overAttr; // connect too many attributess
    if (deriNum < entArr[currEntInd].derisText.length)
      answers.textContent +=
        ++numErr +
        ". The Weak Entity: [" +
        entArr[currEntInd].weakEntiText +
        "]" +
        missDeri; // missing one or more Derived
    if (deriNum > entArr[currEntInd].derisText.length)
      answers.textContent +=
        ++numErr +
        ". The Weak Entity: [" +
        entArr[currEntInd].weakEntiText +
        "]" +
        overDeri; // connect too many Derived
  }
}
// Check each entity and its neighbours
function entityCheck(entToCheck) {
  /* find the index of the entity in problems' dataset array, 
    which will serve as the standard answer for comparison */
  entiNum++;
  var currEntInd;
  for (let index in entArr) {
    if (entToCheck.prop("attrs/text/text") == entArr[index].entiText) {
      currEntInd = index;
      break;
    }
  }
  if (currEntInd == undefined) {
    // If the entity has an incorrect term in it
    answers.textContent +=
      ++numErr +
      ". The term: [" +
      entToCheck.prop("attrs/text/text") +
      "]" +
      incrtType; // not entity
  } else {
    var neighborEle = graph.getNeighbors(entToCheck); // get neighbours of the to-check entity
    var repetitionCheck = [];
    var keyNum = 0,
      attrsNum = 0,
      deriNum = 0,
      relaNum = 0,
      idRelaNum = 0;
    for (let index in neighborEle) {
      // walk through neighbour elements of this entity
      var temp = neighborEle[index];
      var tempNei = graph.getNeighbors(temp);
      // Term repitition check for this entity
      if (repetitionCheck.includes(temp.prop("attrs/text/text")) == false)
        repetitionCheck.push(temp.prop("attrs/text/text"));
      else
        answers.textContent +=
          ++numErr +
          ". The entity: [" +
          entArr[currEntInd].entiText +
          "]" +
          repeatedTerm; // repetition error

      // Identifying Relationship check
      if (temp.prop("type") == "erd.IdentifyingRelationship") {
        if (entArr[currEntInd].idReText.length > 1) {
          // if this entity has a identifying relationship element
          idRelaNum++;
          var relaAtrr = 0;
          if (entArr[currEntInd].idReText[1] == temp.prop("attrs/text/text")) {
            // one iden-relation per entity, and check the term match
            for (let indexRela in tempNei) {
              // walk through neighbour elements of this iden-relation
              if (tempNei[indexRela].prop("type") == "erd.Normal") {
                relaAtrr++; // 
                // attribute of the iden-Relationship
                // one relation one attribute
                if (entArr[currEntInd].idReText.length < 3) {
                  // if this iden-relation does not have attribute
                  answers.textContent +=
                    ++numErr +
                    ". The Identifying Relationship: [" +
                    temp.prop("attrs/text/text") +
                    "]" +
                    IdRelaNoAttr;
                } else {
                  // this iden-relation has an attribute
                  if (
                    tempNei[indexRela].prop("attrs/text/text") !=
                    entArr[currEntInd].idReText[2]
                  )
                    // incorrect attribute selected
                    answers.textContent +=
                      ++numErr +
                      ". The Attribute: [" +
                      tempNei[indexRela].prop("attrs/text/text") +
                      "]" +
                      incrtAttrOwner;
                  if (graph.getNeighbors(tempNei[indexRela]).length > 1)
                    // if this attribute connect to any other elements
                    answers.textContent +=
                      ++numErr +
                      ". The Attribute: [" +
                      tempNei[indexRela].prop("attrs/text/text") +
                      "]" +
                      attrOwners;
                }
              } else if (tempNei[indexRela].prop("type") == "erd.WeakEntity") {
                /*another side of weak-entity check*/
                // Check the connected weak-entity
                removeLink(
                  temp.prop("attrs/text/text"),
                  tempNei[indexRela].prop("attrs/text/text")
                );
                weakEntCheck(tempNei[indexRela]);
              } else {
                if(tempNei[indexRela].prop("attrs/text/text") != entToCheck.prop("attrs/text/text")){
                  /*Iden-Relation should connect with only WeakEntity and its Attribute*/
                  answers.textContent +=
                    ++numErr +
                    ". The Identifying Relationship: [" +
                    temp.prop("attrs/text/text") +
                    "]" +
                    incrtIdenRelaConnect;
                }
              }
            }
            if(entArr[currEntInd].idReText.length == 3 && relaAtrr == 0) // missing attribute for this rela
              answers.textContent += ++numErr + ". The Identifying Relationship: [" + temp.prop("attrs/text/text") + "]" + relaMissAttr;
          } else {
            // Iden-Relation of some other entity
            answers.textContent +=
              ++numErr +
              ". The Identifying Relationship term: [" +
              temp.prop("attrs/text/text") +
              "]" +
              incrtIdenRelaOwner +
              " Or this term" +
              incrtType;
          }
        } else {
          answers.textContent +=
            ++numErr +
            ". The Identifying Relationship term: [" +
            temp.prop("attrs/text/text") +
            "]" +
            incrtIdenRelaOwner +
            " Or this term" +
            incrtType;
        }
      }

      // Relationship check
      if (temp.prop("type") == "erd.Relationship") {
        if (entArr[currEntInd].relation.length > 1) {
          // if this entity has a relationship element
          relaNum++;
          var relaAtrr = 0 // attribute of this iden-relation
          if (entArr[currEntInd].relation[1] == temp.prop("attrs/text/text")) {
            // one relation per entity
            for (let indexRela in tempNei) {
              // walk through neighbour elements of this relation
              if (tempNei[indexRela].prop("type") == "erd.Normal") {
                relaAtrr++;
                // attribute of the Relationship
                // one attribute one relation
                if (entArr[currEntInd].relation.length < 3) {
                  // this relation should not have attribute
                  answers.textContent +=
                    ++numErr +
                    ". The Relationship: [" +
                    temp.prop("attrs/text/text") +
                    "]" +
                    relaNoAttr;
                } else {
                  // this relation has an attribute
                  if (
                    tempNei[indexRela].prop("attrs/text/text") !=
                    entArr[currEntInd].relation[2]
                  )
                    // incorrect attribute selected
                    answers.textContent +=
                      ++numErr +
                      ". The Attribute: [" +
                      tempNei[indexRela].prop("attrs/text/text") +
                      "]" +
                      incrtAttrOwner;
                  if (graph.getNeighbors(tempNei[indexRela]).length > 1)
                    // if this attribute connect to any other elements
                    answers.textContent +=
                      ++numErr +
                      ". The Attribute: [" +
                      tempNei[indexRela].prop("attrs/text/text") +
                      "]" +
                      attrOwners;
                }
              } else if (tempNei[indexRela].prop("type") == "erd.Entity" && tempNei[indexRela].prop("attrs/text/text") != entToCheck.prop("attrs/text/text")) {
                /*another side of entity check*/
                if (
                  tempNei[indexRela].prop("attrs/text/text") !=
                  entArr[currEntInd].entiText
                ) {
                  // Remove the link between the relation and the target entity to avoid self-loop
                  removeLink(
                    temp.prop("attrs/text/text"),
                    tempNei[indexRela].prop("attrs/text/text")
                  );
                  // Check next entity
                  entityCheck(tempNei[indexRela]);
                }
              } else {
                /*Relation should connect with only Entity and its Attribute*/
                if(tempNei[indexRela].prop("attrs/text/text") != entToCheck.prop("attrs/text/text")){
                  answers.textContent +=
                    ++numErr +
                    ". The Relationship: [" +
                    temp.prop("attrs/text/text") +
                    "]" +
                    incrtRelaConnect;
                }
              }
            }
          if(entArr[currEntInd].relation.length == 3 && relaAtrr == 0) // missing attribute for this rela
            answers.textContent += ++numErr + ". The Relationship: [" + temp.prop("attrs/text/text") + "]" + relaMissAttr;
          } else {
            // Relation of some other entity
            answers.textContent +=
              ++numErr +
              ". The Relationship term: [" +
              temp.prop("attrs/text/text") +
              "]" +
              incrtRelaOwner +
              " Or this term" +
              incrtType;
          }
        } else {
          answers.textContent +=
            ++numErr +
            ". The Relationship term: [" +
            temp.prop("attrs/text/text") +
            "]" +
            incrtRelaOwner +
            " Or this term" +
            incrtType;
        }
      }

      // Derived attribute check
      if (temp.prop("type") == "erd.Derived") {
        if (entArr[currEntInd].derisText.length > 0) {
          // if this entity has a Derived attribute
          deriNum++;
          if (
            entArr[currEntInd].derisText.includes(
              temp.prop("attrs/text/text")
            ) == true
          ) {
            if (tempNei.length > 1)
              // multiple Derived attribute ownershop error
              answers.textContent +=
                ++numErr +
                ". The Derived attribute: [" +
                temp.prop("attrs/text/text") +
                "]" +
                deriOwners;
          } else {
            // Derived attribute belong to other entity
            answers.textContent +=
              ++numErr +
              ". The Derived attribute: [" +
              temp.prop("attrs/text/text") +
              "]" +
              incrtDeriOwner +
              " Or this term" +
              incrtType;
          }
        } else {
          answers.textContent +=
            ++numErr +
            ". The Derived attribute: [" +
            temp.prop("attrs/text/text") +
            "]" +
            incrtDeriOwner +
            " Or this term " +
            incrtType;
        }
      }
      // key check
      if (temp.prop("type") == "erd.Key") {
        keyNum++;
        if (
          entArr[currEntInd].keysText.includes(temp.prop("attrs/text/text")) ==
          true
        ) {
          if (tempNei.length > 1)
            // multiple key ownershop error
            answers.textContent +=
              ++numErr +
              ". The Key: [" +
              temp.prop("attrs/text/text") +
              "]" +
              keyOwners;
        } else {
          // key belong to other entity
          answers.textContent +=
            ++numErr +
            ". The Key: [" +
            temp.prop("attrs/text/text") +
            "]" +
            incrtKeyOwner +
            " Or this term " +
            incrtType;
        }
      }
      // Attribute&Composite check
      if (temp.prop("type") == "erd.Normal") {
        attrsNum++;
        if (
          entArr[currEntInd].attrsText.includes(temp.prop("attrs/text/text")) ==
          true
        ) {
          // if the attribute belong to this entity
          if (entArr[currEntInd].composite.length == 0) {
            // if no composite
            if (tempNei.length > 1)
              // multiple attribute ownershop error
              answers.textContent +=
                ++numErr +
                ". The Attribute: [" +
                temp.prop("attrs/text/text") +
                "]" +
                attrOwners;
          } else {
            if (
              temp.prop("attrs/text/text") == entArr[currEntInd].composite[0]
            ) {
              // if composite
              if (tempNei.length > entArr[currEntInd].composite.length) {
                // this attrubite is connected with elements other than components and this entity
                answers.textContent +=
                  ++numErr +
                  ". The Attribute composite: [" +
                  temp.prop("attrs/text/text") +
                  "]" +
                  attrOwners +
                  " Or " +
                  overCompo;
              } else if (tempNei.length < entArr[currEntInd].composite.length) {
                // this attribute is not connected with all componets
                answers.textContent +=
                  ++numErr +
                  ". The Attribute composite: [" +
                  temp.prop("attrs/text/text") +
                  "]" +
                  missCompo;
              } else {
                // component check
                for (let indexComp in tempNei) {
                  if (
                    tempNei[indexComp].prop("attrs/text/text") !=
                    entArr[currEntInd].entiText
                  ) {
                    if (
                      entArr[currEntInd].composite.includes(
                        tempNei[indexComp].prop("attrs/text/text")
                      ) == false
                    )
                      answers.textContent +=
                        ++numErr +
                        ". The component: [" +
                        tempNei[indexComp].prop("attrs/text/text") +
                        "]" +
                        incrtCompOwner +
                        " Or this term " +
                        incrtType;
                  }
                }
              }
            } else {
              // if other attributes
              if (tempNei.length > 1)
                // multiple attribute ownershop error
                answers.textContent +=
                  ++numErr +
                  ". The Attribute: [" +
                  temp.prop("attrs/text/text") +
                  "]" +
                  attrOwners;
            }
          }
        } else {
          // attribute belong to other entity
          answers.textContent +=
            ++numErr +
            ". The Attribute: [" +
            temp.prop("attrs/text/text") +
            "]" +
            incrtAttrOwner +
            " Or this term " +
            incrtType;
        }
      }
      // incorrect connection wit this entity
      if (
        temp.prop("type") == "erd.WeakEntity" ||
        temp.prop("type") == "erd.Entity"
      )
        answers.textContent +=
          ++numErr +
          ". The Entity: [" +
          entArr[currEntInd].entiText +
          "]" +
          incrtEntiConnect;
    }
    if (keyNum < entArr[currEntInd].keysText.length)
      answers.textContent +=
        ++numErr +
        ". The Entity: [" +
        entArr[currEntInd].entiText +
        "]" +
        missKey; // missing one or more keys
    if (keyNum > entArr[currEntInd].keysText.length)
      answers.textContent +=
        ++numErr +
        ". The Entity: [" +
        entArr[currEntInd].entiText +
        "]" +
        overKey; // connect too many keys
    if (attrsNum < entArr[currEntInd].attrsText.length)
      answers.textContent +=
        ++numErr +
        ". The Entity: [" +
        entArr[currEntInd].entiText +
        "]" +
        missAttr; // missing one or more attributess
    if (attrsNum > entArr[currEntInd].attrsText.length)
      answers.textContent +=
        ++numErr +
        ". The Entity: [" +
        entArr[currEntInd].entiText +
        "]" +
        overAttr; // connect too many attributess
    if (deriNum < entArr[currEntInd].derisText.length)
      answers.textContent +=
        ++numErr +
        ". The Entity: [" +
        entArr[currEntInd].entiText +
        "]" +
        missDeri; // missing one or more Derived
    if (deriNum > entArr[currEntInd].derisText.length)
      answers.textContent +=
        ++numErr +
        ". The Entity: [" +
        entArr[currEntInd].entiText +
        "]" +
        overDeri; // connect too many Derived
    if (relaNum < entArr[currEntInd].relation[0])
      answers.textContent +=
        ++numErr +
        ". The Entity: [" +
        entArr[currEntInd].entiText +
        "]" +
        missRela; // missing one Relational
    if (relaNum > entArr[currEntInd].relation[0])
      answers.textContent +=
        ++numErr +
        ". The Entity: [" +
        entArr[currEntInd].entiText +
        "]" +
        overRela; // connect too many Relational
    if (idRelaNum < entArr[currEntInd].idReText[0])
      answers.textContent +=
        ++numErr +
        ". The Entity: [" +
        entArr[currEntInd].entiText +
        "]" +
        missIdRela; // missing one Iden-Relational
    if (idRelaNum > entArr[currEntInd].idReText[0])
      answers.textContent +=
        ++numErr +
        ". The Entity: [" +
        entArr[currEntInd].entiText +
        "]" +
        overIdRela; //  connect too many Iden-Relational
  }
}