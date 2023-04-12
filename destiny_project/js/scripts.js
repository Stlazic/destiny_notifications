const submitBtn = document.querySelector("#subBtn");
//
// All API code
//
const API_URL = "https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayerByBungieName/-1/"

// This API key has extremely limited power because I am only accessing basic information with this code
const API_KEY = "242e5a42ff81470eb55c3c604864a019";

// This only happens if the button exists and then it takes the data from username/numbers and pushes it to the validatePlayer function
if(submitBtn){
    submitBtn.addEventListener("click", e =>{
        var UserName = document.getElementById('username').value;
        var UserNameCode = document.getElementById("numbers").value;
        ValidatePlayer(UserName, UserNameCode)
    })
}

// 
async function ValidatePlayer(UserName, UserNameCode){
    //This establishes a connection to the API

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify({ displayName: UserName, displayNameCode: UserNameCode }),
        //this sets the body of the request to a json string so that the api can read it
    });
    // Checks to see if the connection was successful if so...
    if (response.ok) {
        //This first variable should get the response from the api
        const json = await response.json();
        //Then responseData takes the response and saves it as an array
        const responseData = json.Response;
        // console.log(responseData)
        var success = false;
        let membershipId, membershipType;
             
        // Finds first vaild membershipId                 
        for(const thing in responseData) {
            try{
                membershipId = responseData[thing].membershipId 
                membershipType= responseData[thing].membershipType
                    
                success = true;
                break;
            } 
            catch{
                alert("Invalid Username/Username Code")
                preventDefault()
            }            
        }
    

        //If this connection works and everything goes through, send the user data to localstorage and go to next page
        if(success == true){
            localStorage.setItem("username", UserName)
            localStorage.setItem("usercode", UserNameCode)
            localStorage.setItem("memberID", membershipId)
            localStorage.setItem("memberType", membershipType)
            location.href="/confirm.html"

        // If the connection fails for any reason it will prevent default and alert, this is why I don't need form validation cause if its not an exact match in the API then it wont work.
        }else{
            alert("Invalid Username/Username Code")
            preventDefault()
        }
        
    }else{
        alert("Connection Error Please try again")
        preventDefault()
    }
};

async function findUserCharacterData(){
    // Get the membership id and type
    const membershipId = localStorage.getItem("memberID")
    const membershipType = localStorage.getItem("memberType")
    
    // set the URL using specific user information, this takes us to a big json file of the users data
    const URL = "https://www.bungie.net/Platform/Destiny2/" + membershipType + "/Profile/" + membershipId + "/?components=200";

    // establish a connection to the API using the key
    const response = await fetch(URL, {
        headers: {
            "X-API-Key": API_KEY,
        },
    })

    // if connection is good then save the JSON response and pass it to the next function
    if(response.ok) {
        const json = await response.json()
        const otherResponse = json.Response;
        getPlayerInfo(otherResponse);
    }else {
        // if it fails for some reason then alert and take you back to the signin page
        alert("Error retrieving player data please try again.")
        location.href="/signin.html"
    }
};

// Happens after the async function, this just goes through the json data and pulls the things we need from it
function getPlayerInfo(playerResponse) {
    // this character const is = to the characters data in the json data
    const character = playerResponse.characters.data;
    var charactersInfo = [];
    var characterclass;

    // Each Class has a specific ID number, this assigns that number to the proper text
    // Loops for as many characters a user has on their account (1 is the min 3 is the max)
    for(thing in character){
        const classNum = character[thing].classHash;
        if(classNum == 2271682572) {
            characterclass = "Warlock";
        }
        else if(classNum == 671679327) {
            characterclass = "Hunter";
        }
        else if(classNum == 3655393761) {
            characterclass = "Titan";
        }
        // Makes a dictionary with an array of all the useful character data: Class, Light, and the emblem picture
        characterDict = {
            "Class": characterclass,
            "Light":character[thing].light,
            "emblemBackgroundPath": "https://www.bungie.net" + character[thing].emblemBackgroundPath
        }
        // Append the info to this array
        charactersInfo.push(characterDict)
    }
    // console.log(charactersInfo);
    // Push the array to the display function
    displayCharacter(charactersInfo);
};
//
//API stuff done!
//



// This function displays the character information to the confirmation page
function displayCharacter(charactersInfo) {
    const characterDiv = document.getElementById("charDiv");
    
    //Update the username tag to show username
    loadUsername();

    // Display the hunter/warlock/titan for your account works just like the movie project
    // Loop for each entry in the charactersInfo array
    for (var i = 0; i < charactersInfo.length; i++){

        // This const is set to the dictionary item within the array
        const character = charactersInfo[i];

        // This creates a new div containing all the character information and pushes it to the HTML page
        const characterFull = document.createElement("div")
            characterFull.classList.add("character")
            characterFull.innerHTML =
            `<img src="${character['emblemBackgroundPath']}">
            <p id="charType">${character['Class']}</p>
            <p id="charStat">${character['Light']}</p>`

        characterDiv.appendChild(characterFull);
    }
};

// Only used to load the Username because I had this exact code twice and thats inefficient
function loadUsername(){
    const username = localStorage.getItem("username");
    const usercode = localStorage.getItem("usercode");

    const usernameDiv = document.getElementById("usernameDiv");

    const fullUsername = document.createElement("div");
        fullUsername.classList.add("header");
        fullUsername.innerHTML =
        `<h2>${username}#${usercode}</h3>`
    usernameDiv.appendChild(fullUsername);
};

//
// Check Box Event Listeners
//

const theBoxes = document.querySelectorAll(".checkB");
const allBox = document.querySelector(".allCheckB");
var numOfCheckedBoxes = 0;
var allState = false;
// this checks activates each time a checkbox is checked and adds to the variable so that the program can keep track of how many checkboxes are selected at a particular time.
if(theBoxes) {
    theBoxes.forEach(box => {
        box.addEventListener("click", e =>{
            if(e.target.checked){
                numOfCheckedBoxes++;
            }
            else{
                numOfCheckedBoxes--;
            }
            // If 4 are selected, it selects the "all" checkbox and sets this boolean to true (used later in the submit function)
            if(numOfCheckedBoxes === theBoxes.length) {
                allBox.checked = true;
                allState = true;
            } else {
                allBox.checked = false;
                allState = false;
            }
        })
    });
};

// This is what happens if the "All" checkbox is clicked
if(allBox){
    allBox.addEventListener("click", e => {
        // checks to see if the box was checked, if it was then it checks all the other boxes as well and sets this boolean to true
        if(e.target.checked) {
            theBoxes.forEach(box => {
                box.checked = true;
                numOfCheckedBoxes = theBoxes.length;
                allState = true;
            });
            // if it is unchecked, it will deselect all of the other check boxes and sets the boolean back to false. It would be cool if it saved which ones you had previously had checked but idk how to do that so this is it
        } else {
            theBoxes.forEach(box => {
                box.checked = false;
                numOfCheckedBoxes = 0;
                allState = false;
            });
        }
    });
};

//
// Form Event Listeners
//

const phoneNum = document.querySelector('#phoneNumField');

//Phone Number input field event listener
// Unlike the email, this is solid, prevents users from entering anything but a 10 digit number

if(phoneNum){
    phoneNum.addEventListener("keydown", e => {
        // Removes this class from the input field (changing the color back to normal) 
        if(phoneNum.classList.contains("incomplete")){
            phoneNum.classList.remove("incomplete");
        }

        // Prevents any special characters i dont want them
        if(e.shiftKey){
            e.preventDefault()
        }

        // Only allow numbers, backspace, delete, and left/right arrows
        else if(e.keyCode >= 48 && e.keyCode <= 57 //0-9
            || e.keyCode == 8 //Backspace
            || e.keyCode == 46 //Delete
            || e.keyCode == 37 //left arrow
            || e.keyCode == 39){ //right arrow
            // I honestly only added the arrow functionality because I put my phone number in wrong and had to delete to edit and it annoyed me

        }
        //Anything else is prevented from being typed
        else{
            e.preventDefault()
        }
    });
};

const emailAdd = document.querySelector("#emailField");

//Email input field event listener
// This is super cool but I know it is not correct. I don't know fully how to ensure that a correct email is put in. The way this is done, the user is able to just type a string and submit it. I will look into this further.
if(emailAdd) {
    // Array of allowed characters
    const allowedChars = ["!", "@", "#", "$", "%", "&", "+", ".", "_", "-"];
    emailAdd.addEventListener("keydown", e => {
        // If the user starts to edit this after failing to give a proper email then it will remove the red
        if(emailAdd.classList.contains("incomplete")){
            emailAdd.classList.remove("incomplete")
        }
        // No parenthesis >:( can be bad for database. Must be before the big chunk of allowed characters or else it will allow the parenthesis to go through
        if ((e.keyCode == 57 && e.shiftKey) || (e.keyCode == 48 && e.shiftKey)) {
            e.preventDefault();
        }

        // Only allow letters, numbers, and certain symbols
        else if((e.keyCode >= 65 && e.keyCode <= 90)  // A-Z
        || (e.keyCode >= 97 && e.keyCode <= 122)  // a-z
        || (e.keyCode >= 48 && e.keyCode <= 57) // 0-9
        || e.keyCode == 8 //Backspace
        || e.keyCode == 46 //Delete
        || e.keyCode == 37 //Left arrow
        || e.keyCode == 39 //Right arrow
        || allowedChars.includes(e.key)) { //Checks the special char array to see if it is present there
        }
        
        // Anything else is prevented from being typed
        else {
            e.preventDefault();
        }
    });
};

const providerField = document.querySelector("#provChoice");

// Only used to remove the red if user edits it again.
if(providerField){
    providerField.addEventListener("click", e => {
        if(providerField.classList.contains("incomplete")){
            providerField.classList.remove("incomplete")
        }
    });
};

// 
// After button is pressed on the notification signup page 
// 

function getUserContact() {
    var validForm = false;
    const phoneNumValue = phoneNum.value;
    const emailValue = emailAdd.value;
    const providerValue = providerField.value;

    // this const only exists if the "all" button is selected
    const allCheckedBox = document.querySelector(".allCheckB:checked");

    // Array of all checked boxes, need later
    const checkedBox = document.querySelectorAll(".checkB:checked");

    // Check to make sure that the email and phone number fields are filled out and that they are the appropriate length
    if (emailValue === "" || emailValue.length < 6 || phoneNumValue === "" || phoneNumValue.length < 10 || providerValue === "") {
        // if its the email thats wrong, give it this class name
        // I did this length because im pretty sure the smallest email you can possibly have is X@X.XX
        if (emailValue === "" || emailValue.length < 6) {
            emailAdd.classList.add("incomplete");
        }
        // if the phone num is wrong, give it this class name
        if (phoneNumValue === "" || phoneNumValue.length < 10) {
            phoneNum.classList.add("incomplete");
        }
        // if the provider is not chosen, add class name
        if (providerValue === "") {
            providerField.classList.add("incomplete")
        }
        // regardless, alert that this field is required
        alert("Please fill out all fields");
    }

    //Check to make sure AT LEAST one vendor checkbox is selected
    else if (numOfCheckedBoxes == 0) {
        alert("Please select at least one checkbox.");
    } 
    else {
        // Set this boolean to true, allowing the next part of the function to happen
        validForm = true;
    }


    if (validForm == true){
        const areaVal = document.querySelector("#areaChoice").value;
        // After all validation, the submit will send to database
        var vendorVal = 0;
        // If the ALL box is selected then its set to this value because this is the 'all' value I was told to use
        if(allCheckedBox){
            vendorVal = 256;
        }else {
            // this loops through each checked box in the array and adds the value of the checked box to the others
            checkedBox.forEach(box => {
                vendorVal += parseInt(box.value);
                //  OK so the vendors value is 1, 2, 4, and 8. That way no matter what you select, its clear which vendors you selected. 9 can ONLY be 1 and 8, 13 can ONLY be 1, 4, and 8 and so forth. This number is critical and exactly the same as what will be used in the backend python script.
            });
        }

        var bigPhoneNum = "(" + areaVal + ")" + phoneNumValue 
        const membershipId = localStorage.getItem("memberID")

        POST(emailValue, bigPhoneNum, providerValue, membershipId, vendorVal)
    }
};

// Post to database
async function POST(uName, pNum, provider, membership, vendorVal){
    var NewUser ={
        Username: uName,
        PhoneNumber: pNum,
        Provider : provider,
        MemberShipID: membership,
        CharacterEnum: vendorVal
    };
    let URL = "http://thomasfed.com/api/dvs/NewUser"
    const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(NewUser) 
    });
    if (response.ok) {
        console.log(response.text());
        location.href = "/thanks.html"
    }
    else {     
        console.log("failed");
        alert("Error please try again")
    } 
}


// All pictures used in this website are pulled directly from the Destiny API and are allowed to be used see the links below that allow the use of these images.
// 
// Picture legality (Check “Game Content Rules):
// https://www.bungie.net/7/en/Legal/terms
// Also see:
// https://help.bungie.net/hc/en-us/articles/360049201911-Intellectual-Property-and-Trademarks 