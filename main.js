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
        
        div.classList.add(result.identifier);
        div.classList.add("card", "border", "rounded", "mb-3");
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
    let pageChangerContainer = document.createElement("nav");
    pageChangerContainer.id = "pageNav";

    let pageList = document.createElement("ul");
    pageChangerContainer.append(pageList);
    pageList.classList.add("pagination", "justify-content-center");
    
    let previousButton = document.createElement("li");
    if (currentPage <= 1) {
        previousButton.innerHTML += `<a class="page-link disabled">Previous</a>`; // Not quite working
    }
    else {
        previousButton.innerHTML += `<a class="page-link" href="#">Previous</a>`;
        previousButton.addEventListener("click", () => changePage(currentPage-1));
    }
    pageList.append(previousButton);
    
    let minPage = Math.max(currentPage-1, 1);
    let maxPage = Math.min(currentPage+1, 9998);

    for (let i = minPage; i <= maxPage; i++) {
        let pageButton = document.createElement("li");
        pageButton.classList.add("page-item");
        //pageButton.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        let pageLink = document.createElement("a");
        pageLink.classList.add("page-link");
        pageLink.innerHTML = i;
        if (currentPage != i) {
            pageLink.href = "#";
            pageButton.addEventListener("click", () => changePage(i));
        }
        else {
            pageLink.classList.add("active");
        }
        pageButton.append(pageLink);
        pageList.append(pageButton);
    }

    let nextButton = document.createElement("li");
    if (currentPage >= 100) {
        nextButton.innerHTML += `<a class="page-link disabled">Next</a>`;
    }
    else {
        nextButton.innerHTML += `<a class="page-link" href="#">Next</a>`;
        nextButton.addEventListener("click", () => changePage(currentPage+1));
    }
    pageList.append(nextButton);
    
    main.append(pageChangerContainer);
}

function changePage(newPage) { // changes to the page supplied through newPage
    currentPage = newPage
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
   /* if (downloadableFiles == false) { // if there are no files to be downloaded, return.
        return;
    }*/ // Not working currently


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
        console.log(originalFormats)
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
 
    currentPage = 1 // make sure the serach results start from page 1,

    currentQuery = searchBar.value; 
    currentQuery = currentQuery.replaceAll(" ", "+"); // update the search query,
    
    search(); // then get the search results.
});

downloadSettings.addEventListener("submit", (event) => {
    event.preventDefault();
    let identifiers = [];
    document.querySelectorAll(".clicked").forEach((item) => { // Get the identifiers from each div that has the class "clicked", then get their second class, which should be the identifier.
        identifiers.push(item.classList[0]); // will not work if the identifier is in any other position than 0, but it should always be.
    });
    console.log(identifiers) // Debug

    downloadAll(identifiers); // Then download the files from each item.
});