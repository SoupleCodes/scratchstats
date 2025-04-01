import { fetchUrl, findandReplaceMentions, sanitizeText } from './helperfunctions.js'

export async function getUser(fetchUser) {
    const url = "https://api.scratch.mit.edu/users/" + fetchUser
    try {
        const data = await fetchUrl(url);
        var userside = document.getElementById("userside")
        var userInfoHTML = document.getElementById("userinfo")
        var href = new URL(window.location.href);
        href.searchParams.set('user', fetchUser);
        history.replaceState(null, null, href.toString())

        let projects = [];
        let projectData = [];
        let offset = 0;

        if (data) {
            userInfoHTML.innerHTML = `
            <div id="aboutme"><img src="./images/AboutMe.png"/><div></div></div>
            <br>
            <div id="wiwo"><img src="./images/WIWO.png"/><div></div></div>
            <br>
            <div id="most-viewed"><img src="./images/MVP.png"/></div>
            <div id="most-favorited"><img src="./images/MFP.png"/></div>
            <div id="most-loved"><img src="./images/MLP.png"/></div>
        `;

            try {
                while (true) {
                    let projectUrl = url + `/projects?offset=${offset}&limit=40`;
                    projectData = await fetchUrl(projectUrl);
                    if (projectData.length > 0) {
                        projects.push(...projectData);
                        offset += 40;
                        if (projectData.length < 40) { break }
                    } else { break }
                }

                const sortBy = prop => projects => projects.slice().sort((a, b) => b.stats[prop] - a.stats[prop]);
                const getTop = projects => projects.slice(0, 25);
                const sum = prop => projects => projects.reduce((acc, p) => acc + p.stats[prop], 0);

                const totalViews = sum('views')(projects);
                const totalLoves = sum('loves')(projects);
                const totalFavorites = sum('favorites')(projects);

                const avg = prop => Math.round(prop / projects.length) || 0;
                const [averageViews, averageLoves, averageFavorites] = [avg(totalViews), avg(totalLoves), avg(totalFavorites)];

                userside.innerHTML =
                    `
        <div id="user" class="sidecontainer">
            <p><img id="user-img" src="${Object.values(data.profile.images)[0]}"/></p>
            <p id="username">${data.username || 'Unknown'}</p>
            <p style="color: grey">Location:</p>
            <p style="font-size: 12px">${data.profile.country || 'Unknown'}</p>
            <br/>
            <p style="color: grey">Joined:</p>
            <p style="font-size: 12px">${new Date(data.history.joined).toLocaleString() || 'Unknown'}</p>
        </div>
        <div id="stats" class="sidecontainer">
            <center>Project Stats:</center>
            <ul>
                <li><img src="./images/Heart.png"/> ${totalLoves.toLocaleString()}</li>
                <li><img src="./images/Star.png"/> ${totalFavorites.toLocaleString()}</li>
                <li><img src="./images/View.png"/> ${totalViews.toLocaleString()}</li>
            </ul>
        </div>
        <div id="stats" class="sidecontainer">
            <center>Average Project Stats:</center>
            <ul>
                <li><img src="./images/Heart.png"/> ${averageLoves.toLocaleString()}</li>
                <li><img src="./images/Star.png"/> ${averageFavorites.toLocaleString()}</li>
                <li><img src="./images/View.png"/> ${averageViews.toLocaleString()}</li>
            </ul>
        </div>
            `
                const [topViewed, topLoved, topFavorited] = ['views', 'loves', 'favorites'].map(prop => getTop(sortBy(prop)(projects)));

                function displayTopProjects(projects, elementId, statistic) {
                    const list = document.getElementById(elementId);
                    const projectsDIV = document.createElement('div');

                    if (list) {
                        Object.assign(projectsDIV.style, { display: 'flex', flexDirection: 'row', gap: '5px', maxWidth: '458px', overflowY: 'auto' });

                        projects.forEach(project => {
                            const projectDiv = document.createElement('div');
                            Object.assign(projectDiv.style, { display: 'flex', flexDirection: 'column' });
                            projectDiv.classList.add('project');
                            projectDiv.innerHTML =
                                `
                            <img style="width: 85px;" src="https://uploads.scratch.mit.edu/projects/thumbnails/${project.id}.png" />
                            <a href="https://scratch.mit.edu/projects/${project.id}">
                                <p title="${project.title}">${project.title}</p>
                            </a>
                            <div>
                                <img src="./images/${statistic === "views" ? "View" :
                                    statistic === "loves" ? "Heart" :
                                        statistic === "favorites" ? "Star" :
                                            ''
                                }.png" style="
                                    width: 7px;
                                    vertical-align: middle;
                                ">
                                <small>${project.stats[statistic]}</small>
                            </div>
                            `;
                            projectsDIV.appendChild(projectDiv);
                        });
                    }
                    if (list) { list.appendChild(projectsDIV); }
                }

                displayTopProjects(topViewed, "most-viewed", "views");
                displayTopProjects(topLoved, "most-loved", "loves");
                displayTopProjects(topFavorited, "most-favorited", "favorites");

                const aboutMeDiv = document.querySelector("#aboutme > div")
                const wiwoDiv = document.querySelector("#wiwo > div");
                const preBio = document.createElement('pre');
                const preWiwo = document.createElement('pre');

                preBio.innerHTML = findandReplaceMentions(sanitizeText(data.profile.bio));
                preWiwo.innerHTML = findandReplaceMentions(sanitizeText(data.profile.status));

                aboutMeDiv.appendChild(preBio);
                wiwoDiv.appendChild(preWiwo);

            } catch (error) {
                console.error("Error fetching projects:", error);
            }
            document.title = "Scratchstats - " + data.username

        } else {
            userside.innerHTML = `<p id="username">User not found</p>`
            userInfoHTML.innerHTML = ""
        }
    } catch (error) {
        userInfoHTML.innerHTML = "ERROR"
    }
}