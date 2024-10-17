let data = [];
let searchData = [];
let bookmarks = JSON.parse(localStorage.getItem('bookmarkedVideos')) || [];
const videosPerPage = 10; // Number of videos to display per page
let currentPage = 1; // Current page number
let randomNumbers = []; // To store random order indexes for the videos
let currentSearchResults = []; // To store search results for pagination

// Variable to handle offset for sports videos
let offset = 0;  // Default is 0 (for other pages)

// Function to fetch data for the current page
async function fetchData() {
    let jsonFile;

    // Check the current page URL to determine which JSON file to fetch
    if (window.location.href.includes('music.html')) {
        jsonFile = 'music.json';  // Load music data for music.html
        offset = 4729;
    } else if (window.location.href.includes('movies.html')) {
        jsonFile = 'movies.json';  // Load movie data for movies.html
        offset = 3411;
    } else if (window.location.href.includes('sports.html')) {
        jsonFile = 'sports.json';  // Load sports data for sports.html
        offset = 6009;  // Set offset for sports.json (videos 6010 to 6931 in data.json)
    } else {
        jsonFile = 'data.json';  // Load general data for index.html or other pages
        offset = 0;  // No offset for general pages
    }

    const response = await fetch(jsonFile);
    data = await response.json();
    randomNumbers = generateRandomNumbers(); // Generate random order for the videos
    generateAndDisplayVideos();  // Display videos on page load
}

// Function to fetch search data from data.json (always used for searches)
async function fetchSearchData() {
    const response = await fetch('data.json');
    searchData = await response.json();
}

// Function to generate random unique numbers between 0 and data.length-1
function generateRandomNumbers() {
    const totalVideos = data.length;
    let randomNumbers = [];

    while (randomNumbers.length < totalVideos) {
        let randomNumber = Math.floor(Math.random() * totalVideos);  // Between 0 and data.length-1
        if (!randomNumbers.includes(randomNumber)) {
            randomNumbers.push(randomNumber);
        }
    }
    return randomNumbers; // Return a shuffled array of indexes
}

// Function to check if a video is already bookmarked
function isBookmarked(videoID) {
    return bookmarks.includes(videoID);
}

// Function to toggle bookmark (add/remove) with offset
function toggleBookmark(videoIndex) {
    const realVideoID = videoIndex + offset;  // Adjust video ID based on the offset

    if (isBookmarked(realVideoID)) {
        // Remove bookmark
        bookmarks = bookmarks.filter(id => id !== realVideoID);
    } else {
        // Add bookmark
        bookmarks.push(realVideoID);
    }
    // Update localStorage
    localStorage.setItem('bookmarkedVideos', JSON.stringify(bookmarks));
    // Update bookmark button visuals
    updateBookmarkButtons();
}

// Function to update bookmark button visuals
function updateBookmarkButtons() {
    const bookmarkButtons = document.querySelectorAll('.bookmark-btn');
    bookmarkButtons.forEach(button => {
        const videoID = parseInt(button.getAttribute('data-video-id')) + offset; // Adjust for offset

        if (isBookmarked(videoID)) {  // Ensure videoID is compared as a number
            button.textContent = 'Bookmarked'; // Change button text
            button.classList.add('bookmarked'); // Add a class to style bookmarked videos
            button.style.backgroundColor = '#27ae60';  // Green for bookmarked
        } else {
            button.textContent = 'Bookmark'; // Change button text back
            button.classList.remove('bookmarked'); // Remove the class
            button.style.backgroundColor = 'rgba(255, 71, 87, 0.8)';  // Red for non-bookmarked
        }
    });
}

// Function to display videos based on current pagination
function displayVideos(videoIndexes) {
    const videoGrid = document.getElementById('videoGrid');
    videoGrid.innerHTML = "";  // Clear the video grid

    videoIndexes.forEach(index => {
        const videoData = data[index];  // Fetch from current page's data
        const videoItem = document.createElement('div');
        videoItem.classList.add('video-item');

        // Create a link for description and thumbnail
        const descriptionLink = document.createElement('a');
        descriptionLink.href = videoData.URL;
        descriptionLink.target = "_blank";
        descriptionLink.textContent = videoData.DESCRIPTION;

        const thumbnailLink = document.createElement('a');
        thumbnailLink.href = videoData.URL;
        thumbnailLink.target = "_blank";
        
        const thumbnailImage = document.createElement('img');
        thumbnailImage.src = videoData.THUMBNAIL;
        thumbnailImage.alt = "Thumbnail";

        // Create a bookmark button
        const bookmarkButton = document.createElement('button');
        bookmarkButton.classList.add('bookmark-btn');
        bookmarkButton.setAttribute('data-video-id', index.toString()); // Use the video index as string
        bookmarkButton.textContent = isBookmarked(index + offset) ? 'Bookmarked' : 'Bookmark'; // Initial text
        bookmarkButton.style.backgroundColor = isBookmarked(index + offset) ? '#27ae60' : 'rgba(255, 71, 87, 0.8)'; // Adjust color based on bookmark status

        // Add event listener for bookmarking
        bookmarkButton.addEventListener('click', (e) => {
            e.preventDefault();  // Prevent page reload
            e.stopPropagation(); // Prevent the click from bubbling up to the video item
            toggleBookmark(index); // Toggle bookmark with index
        });

        // Append links, thumbnail, and bookmark button to the video item
        videoItem.appendChild(descriptionLink);
        videoItem.appendChild(document.createElement('br'));  // Add line break
        thumbnailLink.appendChild(thumbnailImage);
        videoItem.appendChild(thumbnailLink);
        videoItem.appendChild(bookmarkButton); // Add bookmark button

        // Append video item to the grid
        videoGrid.appendChild(videoItem);
    });

    // Update bookmark button visuals
    updateBookmarkButtons();
}

// Function to generate and display videos for the current page
function generateAndDisplayVideos() {
    const startIndex = (currentPage - 1) * videosPerPage; // Calculate start index
    const endIndex = startIndex + videosPerPage; // Calculate end index
    const currentVideos = randomNumbers.slice(startIndex, endIndex); // Get current page videos
    displayVideos(currentVideos);

    updatePaginationButtons(randomNumbers.length); // Update pagination buttons
}

// Function to update pagination buttons
function updatePaginationButtons(totalVideos) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; // Clear existing pagination

    const totalPages = Math.ceil(totalVideos / videosPerPage); // Calculate total pages

    // Create previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1; // Disable if on first page
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            if (currentSearchResults.length > 0) {
                generateAndDisplaySearchResults(); // Refresh search results for the new page
            } else {
                generateAndDisplayVideos(); // Refresh main videos for the new page
            }
        }
    });
    paginationContainer.appendChild(prevButton);

    // Create next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages; // Disable if on last page
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            if (currentSearchResults.length > 0) {
                generateAndDisplaySearchResults(); // Refresh search results for the new page
            } else {
                generateAndDisplayVideos(); // Refresh main videos for the new page
            }
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Function to perform search based on the "DESCRIPTION" field (from data.json)
function searchVideos() {
    const searchQuery = document.querySelector('.search-container input').value.toLowerCase();
    const searchHeading = document.getElementById('searchHeading'); // Get the search heading element

    // Filter the search results from searchData (which comes from data.json)
    currentSearchResults = searchData
        .map((video, index) => ({ video, index })) // Map videos with their indexes
        .filter(item => item.video.DESCRIPTION.toLowerCase().includes(searchQuery)) // Filter videos by description
        .map(item => item.index); // Get the indexes of matching videos

    // Display the search term in the heading
    searchHeading.textContent = `Search Results: "${searchQuery}"`;

    // Check if there are results to display
    if (currentSearchResults.length > 0) {
        currentPage = 1; // Reset to first page for new search
        generateAndDisplaySearchResults(); // Display matching videos
    } else {
        alert('No videos found with the search term!');
    }
}

// Function to display search results with pagination
function generateAndDisplaySearchResults() {
    const startIndex = (currentPage - 1) * videosPerPage; // Calculate start index
    const endIndex = startIndex + videosPerPage; // Calculate end index
    const currentVideos = currentSearchResults.slice(startIndex, endIndex); // Get current page results
    displayVideos(currentVideos); // Display the search results

    updatePaginationButtons(currentSearchResults.length); // Update pagination for search results
}

// Fetch data and search data on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    fetchSearchData(); // Always fetch search data from data.json
});

// Attach search event to search button
document.querySelector('.search-container button').addEventListener('click', searchVideos);
