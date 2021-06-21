//Budget Controller
var budgetController=(function(){
    var Expense = function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    }

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome ) * 100);
        }else{
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    }

    var data = {
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:0
    }

    var calculateTotal = function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type]=sum;
    }

    return {

        addItem : function(type,des,val){
            var newItem,ID;

            //Creating new ID for every item
            if(data.allItems[type].length > 0){
                ID=data.allItems[type][data.allItems[type].length - 1].id +1; //ID of last item + 1 
            }else{
                ID=0; //starting ID
            }

            //creating newItem
            if(type === "exp"){
                newItem = new Expense(ID,des,val);
            }else if(type === "inc"){
                newItem = new Income(ID,des,val);
            }

            //adding newItem
            data.allItems[type].push(newItem);

            //retruning the added newItem
            return newItem;
        },

        deleteItem : function(type,ID){
            var index,IDs;
            IDs = data.allItems[type].map(function(current){
                return current.id;
            });
            index = IDs.indexOf(ID);

            // deleting item from data structure
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },

        calculateBudget : function(){

            // calculate total income and total expense
            calculateTotal("inc");
            calculateTotal("exp");

            // calculate the budget
            data.budget=data.totals.inc-data.totals.exp;

            // calculate the percentage of income spent
            if(data.totals.inc >0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage=-1;
            }
        },

        calculatePercentages : function(){

            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages : function(){
            var result;

            result = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });

            return result;
        },

        getBudget : function(){
            return {
                budget : data.budget,
                percentage : data.percentage,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp
            };
        }
    }
})();


//UI Controller
var UIController=(function(){

    var DOMstrings={
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer:".income__list",
        expenseContainer:".expenses__list",
        budgetLabel:".budget__value",
        incomeLabel:".budget__income--value",
        expensesLabel:".budget__expenses--value",
        percentageLabel:".budget__expenses--percentage",
        container:".container",
        itemPercLabel : ".item__percentage",
        dateLabel : ".budget__title--month"
    };

    var formatNumber = function(num,type){
        var int,dec,numSplit,type;

        num = Math.abs(num);
        num = num.toFixed(2); // return a string with exactly 2 decimal places

        numSplit = num.split(".");
        int = numSplit[0];

        // adding commas
        if (int.length > 3){
            int = int.substr(0,int.length-3) + "," + int.substr(int.length-3,3);
        }
        dec = numSplit[1];

        return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
    };

    return {

        getInput : function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        getDOMstrings : function(){
            return DOMstrings;
        },

        addNewItem : function(obj,type){
            var html,newHtml,element;

            // Create html string with placeholder
            if(type === "inc"){
                element=DOMstrings.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === "exp"){
                element=DOMstrings.expenseContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace placeholder with text
            newHtml=html.replace("%id%",obj.id);
            newHtml=newHtml.replace("%description%",obj.description);
            newHtml=newHtml.replace("%value%",formatNumber(obj.value,type));

            // inserting the html
            document.querySelector(element).insertAdjacentHTML("beforeend",newHtml);

        },

        deleteNewItem : function(id){
            var el;

            el = document.getElementById(id);
            el.parentNode.removeChild(el);
        },

        clearFields : function(){
            var fields,fieldsArr;
            fields=document.querySelectorAll(DOMstrings.inputDescription+","+DOMstrings.inputValue);
            fieldsArr=Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current,index,array){
                current.value="";
            });
            fieldsArr[0].focus();
        },

        displayBudget : function(obj){
            var type;
            (obj.budget > 0) ? type = "inc" : type = "exp";

            document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalInc,"inc");
            document.querySelector(DOMstrings.expensesLabel).textContent=formatNumber(obj.totalExp,"exp");
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage+"%";
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent="---";
            }
        },
        
        displayPercentages : function(percentages){
            var fields;

            fields = document.querySelectorAll(DOMstrings.itemPercLabel);
            for ( var i=0; i<fields.length;i++){
                if (percentages[i]  > 0){
                    fields[i].textContent = percentages[i]+"%";
                }else{
                    fields[i].textContent = "---";
                }
            }
        },

        displayDate : function(){
            var now,month,year,arr;

            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            arr = ["January","February","March","April","May","June","July","August","September","October","November","December"];
            document.querySelector(DOMstrings.dateLabel).textContent = arr[month] + " " + year;
        },

        changedType : function(){
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputType + "," + DOMstrings.inputDescription + "," + DOMstrings.inputValue);
            for ( var i=0; i < fields.length; i++){
                fields[i].classList.toggle("red-focus");
            }

            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
        }
    };
    
})();


//Global0 App Controller
var controller=(function(budgetCtrl,UICtrl){
    // Initializing default type
    document.querySelector(".add__type").selectedIndex = 0;

    var setupEventListeners=function(){
        var DOM=UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener("click",ctrlAddItem);
        document.addEventListener("keypress",function(event){
            if(event.keyCode===13 || event.which===13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click",ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change",UICtrl.changedType);
    }

    var updateBudget = function(){

        //Calculate the budget
        budgetCtrl.calculateBudget();


        // Return budget
        var budget = budgetCtrl.getBudget();

        //Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function(){
         
        // Calculate the percentages
        budgetCtrl.calculatePercentages();

        // return percentage
        var allPerc = budgetCtrl.getPercentages();

        // Display the percentage on te UI
        UICtrl.displayPercentages(allPerc);
    };

    var ctrlAddItem = function(){
        var input,newItem;

        //Get the field input data
        input=UICtrl.getInput();

        if(input.description!="" && !isNaN(input.value) && input.value>0){ 

             //Add item to budget controller
              newItem=budgetCtrl.addItem(input.type,input.description,input.value);
              
              //Add item to the UI
              UICtrl.addNewItem(newItem,input.type);

              // Clearing input fields
              UICtrl.clearFields();
              
              // Updating the budget
              updateBudget();

              // Update the percentages
              updatePercentages();
        } else {
            alert("Enter valid inputs");
        }
        

    };

    var ctrlDeleteItem = function(event){
        var itemID,items,type,ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
         
        if(itemID){
            items = itemID.split("-");
            type = items[0];
            ID = parseInt(items[1]); 
            
            // Deleteing item from data structure
            budgetCtrl.deleteItem(type,ID);

            // Deleting item from UI
            UICtrl.deleteNewItem(itemID);
            
            // Updating the totals and Budget
            updateBudget();

            // Update the percentages
            updatePercentages();
        }
    }

    return {
        init:function(){
            console.log("Application has started.");
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget : 0,
                percentage : 0,
                totalInc : 0,
                totalExp : 0
            });
            setupEventListeners();
        }
    }

})(budgetController,UIController);

controller.init();