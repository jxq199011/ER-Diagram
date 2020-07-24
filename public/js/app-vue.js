var problemIndex;
new Vue({
  el: "#wrap",
  data: {
    currentForm: {
      text: "1. Students [ER]",
      index: "1",
      value:
        "1. Draw an ER diagram to represent information about students. A student is identified by his/her student number. Student's name ( first and last ), permanent address , phone number , gender and date of birth are also stored.",
    },

    options: [
      {
        text: "1. Students [ER]",
        index: "1",
        value:
          "1. Draw an ER diagram to represent information about students. A student is identified by his/her student number. Student's name ( first and last ), permanent address , phone number , gender and date of birth are also stored.",
      },
      {
        text: "2. Airplanes [ER]",
        index: "2",
        value:
          "2. An airplane has a registration number, type, number of economy class seats, number of business class seats and the year of production.",
      },
      {
        text: "3. Courses [ER]",
        index: "3",
        value:
          "3. A course is known by its unique course code, name, number of lecture hours per week, number of tutorials per week and the semester in which the course is offered.",
      },
      {
        text: "4. Cars [ER]",
        index: "4",
        value:
          "4. A car is identified by its make, model, plates, year of manufacture, engine number, chassis number, cc rating, number of passengers, motive power (p for petrol, g for gas and d for diesel) and colour. Note that a car may have several colours - e.g. when the top is of a different colour from the body.",
      },
      {
        text: "5. Student Halls [ER]",
        index: "5",
        value:
          "5. Some students live in student halls. Each hall has a name (unique) and an address. Each student has a number (unique) and a name. Assume that there are students living in every hall.",
      },
      {
        text: "6. Books [ER]",
        index: "6",
        value:
          "6. Each text book has a unique ISBN (International Standard Book Number), and contains several chapters. Each chapter has a chapter number (unique within a book), the number of pages and the number of references. A chapter covers a single topic, but the same topic may be covered in various books.",
      },
      {
        text: "7. Lecturers [ER]",
        index: "7",
        value:
          "7. Each lecturer is identified by a unique number, name and phone. A lecturer teaches several courses, and for each course there is a unique code and title (not necessarily unique). There might be several lecturers in a course.",
      },
      {
        text: "8. Course Grades [ER]",
        index: "8",
        value:
          "8. For each course a student has passed, we need to know the final grade. Each course has a unique course code and a student has his/her student id, name and address.",
      },
      {
        text: "9. Required Books [ER]",
        index: "9",
        value:
          "9. Each course requires one or more text books. Each text book is used in at least one course. A text book is identified by a unique ISBN, and its title,authors, publisher and year of publication are known. Each course has a unique code.",
      },
      {
        text: "10. Surveillance [ER]",
        index: "10",
        value:
          "10. You are to design a database for a surveillance system. The system consists of a number of sensors that collect data from various locations within buildings. Every sensor has a number(unique), manufacturer, model, initialization sequence, unit of measurements, sampling interval, maximal value and the state (one of ON, OFF, STANDBY). Critical sensors are specially labeled. Each building has sensors, and for each sensor, the database should store the building it is located in, as well as the location within the building. A building is known by its address(unique) and the phone number to use in case of an emergency. The alarm is activated if the signal value from a sensor exceeds the maximal value. The systems stores data about each activation of the alarm: the date, time and the signal value of the sensor that caused the activation."

          // "10. Sometimes students work in groups. Each group has a unique number and students have their ids. A student who works in a group has a specific role within that group. The student may have different roles in various groups he/she belongs to.",
      },
      // {
      //   text: "11. Bank [ER]",
      //   index: "11",
      //   value:
      //     "11. Design a database for a bank. The bank has many customers. Every customer has at least one account with the bank. An account may be shared by several customers. Each customer has a unique customer number, name ( first, middle and last ), address, tax number, and phone number. Each account has a unique number, type (cheque or savings), the opening date and the balance.",
      // },
      // {
      //   text: "12. Flights [ER]",
      //   index: "12",
      //   value:
      //     "12. A flight carries many passengers on a specific airplane. Each airplane has a unique number, while each flight has a code (unique), destination and origin. A passenger has a name, passport number and nationality.",
      // },
      // {
      //   text: "13. Woodwork Shop [ER]",
      //   index: "13",
      //   value:
      //     "13. Design a database for the woodwork shop. The database should store information about suppliers and the products they offer. Each supplier has a unique number, name and an address. For each product, the database should store its number (unique), name and optionally the colour. A product may be offered by several suppliers, with different prices. There are no products with prices smaller than $20.",
      // },
      // {
      //   text: "14. Music [ER]",
      //   index: "14",
      //   value:
      //     "14. You are to design a database to hold data about composers and the compositions they composed. There is a unique number for each composer, his/her name, country, year of birth, year of death and the era (e.g. classical, baroque, romantic, modern) in which the composer lived. Information about the compositions includes a unique composition number, title, and (optionally) nickname, type of the composition (e.g. symphony, concerto, instrumental, chamber, opera, choral etc.) and composer who composed it.",
      // },
      // {
      //   text: "15. Travel Agency [ER]",
      //   index: "15",
      //   value:
      //     "15. Design a database that will hold information for a small travel agency to conduct its business. Agency exclusively offers trips. Each trip is identified by a number. For each trip, the name, the price per person and duration of the trip (in days) are stored. A trip is offered every week on the same day. A trip on a certain date can be booked by a customer. Each customer gets a unique number, and the database should also store the customer's name, address, phone number and email. A customer can book different trips on different dates.",
      // },
    ],
  },
  methods: {
    theNextProblem() {
      var theIndex = this.options.indexOf(this.currentForm);
      // if he index is -1, then jump to the first question
      if (theIndex < 0) {
        this.currentForm = this.options[1];

        // console.log("x" + this.options.indexOf(this.currentForm));
        //already in the last question, jump to the fist question
      } else if (theIndex === this.options.length - 1) {
        this.currentForm = this.options[0];
      } else {
        // move to the next question
        this.currentForm = this.options[theIndex + 1];
        // console.log("d" + this.options.indexOf(this.currentForm));
      }
    },
    getProblemIndex(){
      problemIndex = this.currentForm.index-1;
    },
    clean() {
      document.getElementById("answerContent").innerHTML = "";
    },

    getGoodHref: function () {
      window.open("http://localhost:5000/solution" + this.currentForm.index),
        "_blank ";
    },
  },
});
