/* DOM Objects */
const searchForm = document.querySelector("#searchForm");
const searchBar = document.querySelector("#searchbar");
const main = document.querySelector("main");
const downloadTypeSelector = document.querySelector("#downloadTypeSelector");
const downloadSettings = document.querySelector("#downloadSettings");
// https://archive.readme.io/reference/creating-an-item
/* Global variables */
let currentPage = 1;
let currentQuery = "";



async function search() {
    if (currentQuery != "") {
        main.innerHTML = "";
        let url = "https://archive.org/advancedsearch.php?q=";
        url += currentQuery + "&output=json&rows=50&page=" + currentPage;
        console.log(url) // Debug
        let results = fetch(url);
        results = await results;
        results = await results.json();
        results = results.response.docs; // get the items from the search api
        console.log(results); // Debug
        
        displaySearchResults(results); // display them in the main container

        makePageChanger();
    }
}

function displaySearchResults(results) {
    for (let result of results) { // create a div for each search result that contains the title (which is a link to the item) and description, then append it to the search results
        let div = document.createElement("div");
        let title = document.createElement("a");
        let description = document.createElement("p"); // Create the elements
        
        div.classList.add("card");
        div.classList.add(result.identifier);
        title.classList.add("title"); // Set the classes of the elements

        title.href = "https://archive.org/details/" + result.identifier;
        title.target = "_blank"
        description.classList.add("description"); // Set the location title links to.

        title.textContent = result.title;
        description.textContent = result.description; // Populate the elements with information

        div.addEventListener('click', (event) => {
            if (event.target.className != "title") { // if the div is clicked anywhere that is not the title, if it has the class clicked, remove it, otherwise add it.
                div.classList.contains("clicked") ? div.classList.remove("clicked") : div.classList.add("clicked");
            }
        });

        div.append(title);
        div.append(description);
        main.append(div); // Append the elements to main.
        
    }
}

function makePageChanger() { // Add the navigation buttons to the bottom of the search results
    let pageChangerContainer = document.createElement("div");
    pageChangerContainer.id = "changePageForm";
    if (currentPage > 1) { // If page 2 or greater is being displayed, add the back button
        let backButton = document.createElement("button");
        backButton.id = "backButton";
        backButton.textContent = "Back";
        backButton.addEventListener('click', () => changePage(-1));
        pageChangerContainer.append(backButton);
    }
    if (currentPage < 9999) { // if page 9998 or less is being displayed, add the next button (cannot go higher because of API limits)
        let nextButton = document.createElement("button");
        nextButton.id = "nextButton";
        nextButton.textContent = "Next";
        nextButton.addEventListener('click', () => changePage(1));
        pageChangerContainer.append(nextButton);
    }
    
    main.append(pageChangerContainer);
}

function changePage(amount) { // Add amount to the page and then get the next page of search results (amount should be negative to go backwards and positive to go forwards, and is unlikely to need to be any number other than 1 or -1)
    currentPage += amount;
    search();
}

async function download(identifier) {
    let downloadType = downloadTypeSelector.value;
    
    let linkTagDownloaderHelper = document.createElement("a"); // create an invisible anchor tag
    
    let metadata = await fetch("https://archive.org/metadata/" + identifier);
    metadata = await metadata.json();
    metadata = metadata.files; // get the metadata, then keep only the data about the files.

    let downloadableFiles = false;
    for (let file of metadata) { // if any file is not private, set downloadableFiles to true.
        if (file.private == false) {
            downloadableFiles = true;
        }
    }
    if (downloadableFiles == false) { // if there are no files to be downloaded, return.
        return;
    }


    if (downloadType == "allFiles") { // if the original files filter is not on, set the anchor's href to the item's compress page.
        linkTagDownloaderHelper.href = "https://archive.org/compress/" + identifier; 
    }
    else if (downloadType == "originalFiles") {// // if the original files filter is on, set the anchor's href to the item's compress page with formats set to the formats you want to download.
        let originalFormats = [];
        for (let file of metadata) {
            if (file.source == "original" && !(originalFormats.includes(file.format)) && (file.private != "true")) {
                originalFormats.push(file.format);
            }
        }
        if (originalFormats == []) { // if there are no files to be downloaded, return.
            return;
        }
        let formatsString = "";
        for (let format of originalFormats) {
            formatsString += format + ",";
        }
        linkTagDownloaderHelper.href = `https://archive.org/compress/${identifier}/formats=${formatsString}`;
    }
    linkTagDownloaderHelper.target = "_blank"; // Set the anchor tag's attributes so that the browser opens it in a new tag
    linkTagDownloaderHelper.download = true;   // and recognizes it as a file to be downloaded,
    linkTagDownloaderHelper.click(); // then click the anchor tag to download the file.
    console.log(linkTagDownloaderHelper); // Debug
}

async function downloadAll(identifiers) { // identifiers should be an array of strings.
    for (let identifier of identifiers) { // for each identifier, download the corresponding zip file, then wait 1 second.
        await download(identifier);
        setTimeout(1000);
    };

}

searchForm.addEventListener("submit", (event) => { // When the search form gets submitted,
    event.preventDefault();
 
    page = 1 // make sure the serach results start from page 1,

    currentQuery = searchBar.value; 
    currentQuery = currentQuery.replaceAll(" ", "+"); // update the search query,
    
    search(); // then get the search results.
});

downloadSettings.addEventListener("submit", (event) => {
    event.preventDefault();
    let identifiers = [];
    document.querySelectorAll(".clicked").forEach((item) => { // Get the identifiers from each div that has the class "clicked", then get their second class, which should be the identifier.
        identifiers.push(item.classList[1]); // will not work if the identifier is in any other position than 1, but it should always be as "card" should be the first class.
    });
    console.log(identifiers) // Debug

    downloadAll(identifiers); // Then download the files from each item.
});