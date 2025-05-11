firebase.initializeApp(firebaseConfig);
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        user.getIdTokenResult().then(async (idTokenResult) => {
            if (!idTokenResult.claims.admin) {
                alert("Access denied. You are not authorized to view this page.");
                window.location.href = "../index.html"; // or unauthorized.html
            } else {
                const email = user.email;
                const snapshot = await firebase.database().ref("members").orderByChild("email").equalTo(email).once("value");
                if (snapshot.exists()) {
                    const userData = Object.values(snapshot.val())[0];
                    const fullName = `${userData.fname || ""} ${userData.lname || ""}`.trim();
                    document.getElementById("accountName").textContent = fullName;
                } else {
                    document.getElementById("accountName").textContent = email.split('@')[0]; // fallback
                }
            }
        }).catch((error) => {
            console.error("Error checking admin claim:", error);
            window.location.href = "../index.html";
        });
    } else {
        alert("You are not logged in!");
        window.location.href = "../joinlogin.html";
    }
});

const addTask = document.getElementById("addTask")

function skillClicked(e) {
    if (e.classList.contains("clicked")) {
        e.classList.remove("clicked")
    } else {
        e.classList.add("clicked")
    }
}

function headingSelect(left) {
    activeHeading = document.getElementById("activeHeading")
    currentTasks = document.getElementById("currentTasks")
    previousTasks = document.getElementById("previousTasks")
    activeHeading.style.left = left

    if (left == 0) {
        currentTasks.style.display = "flex"
        previousTasks.style.display = "none"
    } else {
        currentTasks.style.display = "none"
        previousTasks.style.display = "flex"
    }
}

function formOpen() {
    addTask.style.pointerEvents = "all"
    addTask.style.opacity = "1"
}



// form store --------------
const db = firebase.firestore();

// 3. Form Submission Handling
document.querySelector("form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const taskInputs = document.querySelectorAll(".taskname");
    const taskName = taskInputs[0].value.trim();
    const promptLink = taskInputs[1].value.trim();

    const deadline = document.querySelector(".dateInput").value;
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    const clickedSkills = Array.from(document.querySelectorAll(".skill.clicked")).map(el => el.textContent.trim());


    if (!taskName || !promptLink || !deadline || clickedSkills.length === 0) {
        alert("Please fill all fields and select at least one skill.");
        return;
    }

    try {
        var webhookURL;
        var payload;
        for (let skill of clickedSkills) {


            if (skill == "Programming") {
                webhookURL = "https://l.webhook.party/hook/rfyEb3L6HHnhLey%2BAiPlueXUqA12MPcjIN3HgiOSxAm%2F7jg8VGY9FJMKnuVyRBMYcw4Wt3w8GV8Qfk%2BbJgvZ%2Fva45iCg0u0MoBd4mMLnS7WsgIc1tVZsxWpDoQ3yDLwkZtgfSs9dcPYfbdDEcy0T404yBWakCkyfdXIfke%2FhpIFBpvDotvvXAPO1Hzv7RyWFEKk3%2F41WF%2FNYlvUQHBnqrizvSvWcenXROIjQp9CfjG1HKmMroi5ZsJCUM3WicBw7VbMWe4jvlRkvenUp0xkodw3UpNpuuqqlVgsJ5bA9IitDf2XJq4yplMLT41aH5zljyob0JN9maiGIXcsh4IN%2BZumds2pYTw9ffyLg1oHHUOua2fPoLvTmaEib18mqWBq3E3h36umImdc%3D/Jp3GJGfSlNmNGNNj"

            } else if (skill == "Web Development") {
                webhookURL = "https://l.webhook.party/hook/IWYcM0iC33Zz4pfO2domAvw2iNASv4Zh6%2Fd42HGvudmGZaPB0PsHwsmy%2Ftk%2BUXC5aA27%2BdPkM6TM0TJ2RVYZiN2OVzFTfxVfYLGEvEhUPCfC6oPewOUacR%2FJfIjqAAPvquhVu4t0PW6f7YPVIu2K5UsZPW0byYnDBcwKqP6HssyMm3YQkTXwjll2bdk5%2FFBaids%2F0SvZEoMmoFbbLL%2BZFfOplp4hc1t31tRbTKW535xMmft29pdy3P75HbmgsXmteG5Uwge3%2BphcCima4x38gLxm24%2FYk9UDWXjP0W8j65luMhPiQXZauhNNeKpB8FFd2qbRQ5nEjpGFfM0npE4Y4UoFVijIbHoPKcUZa0IVAYrgGR7ZMoELUaCHebqJiMG1Yo3J61FMOzQ%3D/1CFaMrMKFG6jwbdD"

            } else if (skill == "Motion Design") {
                webhookURL = "https://l.webhook.party/hook/pGEBBptpCcLgw0IHW7iFSCAU6fyNKxJ4MK8Qtl9zvHV%2BE2%2BxKBYOw2ixh2uZosXyuHKJ4izDqvKecIftCDGz0pc1UkXxAkuNyn1kvWHbWZdjmvNFlfL0Ddnv3NLQR1z%2FyuiUxwunJv%2FEMcsuxVeG0wWYvOKtLJxlwlsStSR5iuANPO9vpBoDaRlb4FPMSjEDzW9qWyUwZZrw8fvtmVOL7rTEEXaQxejr1WudrhyCNLDPqgTbydTwSDO9TlDTlKPXUg7DZiUqtxanqzGEbPe8c%2Bin372cccvFh5NKtuoo9g0o98fBIlAIeROf%2BHisPGySkPCTKHz29%2FL%2FEJIBV5%2B2%2FbCKisHgnGoQaZyWtLXecnyVQ5V11wAihbJqwTYGw0GEI66eGmt9Kog%3D/liy2q9%2FMm%2BUm3ciu"

            } else if (skill == "Graphic Design") {
                webhookURL = "https://l.webhook.party/hook/CJVFhiuiNAChd1%2Fc6%2FETYacnCRJTxbcwbp1mYyGEAuR7cwwY5ibcjZ2i4ktlghJfcqiGj28Ppwc2FkJnV3mlHy9FnaFPMxQHSoOP87PWJoWUNBVx5ob%2BXN7FYEagjl4u0Wq%2B19F5NC2S0anbW28W4ho%2FyaCC7GF8eN%2BjVqNzgdvtcsfMc50ChQgvmYUdYRUQqrECWfNnY88K%2BFw0qXZfPn4WEI0DF6ptSXtCoDFuSy2SnXGfKrHrctnR3kSi%2F50dHo8ZJJINBXwqAU5yQb3drt1J0QRrJXRpASGH8za%2BzNFDmmRc7yTnkkXKgPiQi2tC7rzTGZqroLu9IjPqDqqxDnqiV9lofW1M5a3XkqXtAQAVwiPemmttkjNLXGzjF11x10MUrW2NLic%3D/nhL0hNIqt2ytDrCm"

            } else if (skill == "Cryptic") {
                webhookURL = "https://l.webhook.party/hook/CzI%2BScXklJIpVL6WWaZaTXCbtVjMzUzoNNKJFkiaNjrC2hBk8niqFCwkxGQqMeNd9sR4jHAohYEPOJNcItD4QTYHQOkp8IdJN917WQZAYg7H8pFN18aeKAZI8TBhDeXExcbMPKBRmv5RnA6nwvp4PoOwtiug6QzMb99A8PRgYQsbhzCU2eBUnH4CzDyOZmYSTK37NC2HHJaox3yW65lFQpG7jueSG4TzXb2bzHlMY0231x6DmlHsSankScntPEKLeN3DML9t9Cgb9Pd9wXYGk%2Fu4ipNGRBjGcLaLfRvpvPpbjwQpQLzoHQHr9EW87cZI%2FJZEstlZSRf7ZBrzPGOmTsr2IHx9wIxZYCOI6Y5f0ltKm3NDy8FJARhCYJr0VCo9gjL9JVVj1K4%3D/ajW%2BmC%2Bm7h5zEgdB"

            } else if (skill == "Photographer") {
                webhookURL = "https://l.webhook.party/hook/1RnAzk1myXLFgcUbACpjJNqOKiGGVqOsK6H%2BhtnDYUBERiE4ZjPjtOG40od1c%2FfaAj%2BLYOu9IN6VsQpWGKQc6aObEnHzHc%2BxLOJFEKiRKbYtEdHTlCvHfrWFfqVNGYCDNLp4ptr6VQ%2By%2FMsHqAiiBX73qoa9A%2BuYXsCy0pZWf5WB9fc7eV9%2BANElKRzjjFQQlCFcnRhMlDxiHVFiBsKkbBIzo5HGqouOohr8vjT2g38zJKGHpLStNFzFknB01C8lAGgARUfUQpCgxIEBqVwPvvNT1JGkCkEy2lV2eue3GZLxBznM6aiou0IRa63qSFs4hcKMDfVCO1Uu1n%2BwaC%2BxvPR%2FULChKzPs2BA4gsKkqhh%2F5bvEkbRcugcKmG6GSBuy9Cw89qX5qxs%3D/QlAUSkpHJJD26khI"

            } else if (skill == "Group Discussion") {
                webhookURL = "https://l.webhook.party/hook/tduBogS37EROddVRvgaW6PNHQ0ErAKMlz%2Bwj5QThw5gkVeRzbUxrsvEMclEGcnKiaMf6r8BU5X%2FY951d9znPgTCnR%2F64G%2FBwXc7aJzuX0rCAlh2ez56jLeNWlGvJJkxGhIIVdbhoCzvUwhqlEjRy%2BL3BxLntK%2BcP%2FP20pf2i9aA395pSZAfyyK0x9Grsz1BbskNe2WF0KjPV2xLEYMx5emxvwYsSY0ULVA2jm9ZKqTV1916NPryh%2Fv3Aj9cjMfkqdNIHq33EdHPXgxSnO1MRsLNKNE5y03r%2B0%2FPIbKUxaYr5y7hOhUy1GkwsN2BMdNsJkwWE0nrRDVM%2BnxiIethU0h1w1ZCZyrTiJIJIB1629BUgzmAgVAzwyjnqUMJG4jVbQ1choJJgsPw%3D/CJ6nD%2F78tb%2BdtC0k"

            } else if (skill == "Quizzer") {
                webhookURL = "https://l.webhook.party/hook/lzhHhZiDZMzxtLQSyI%2FwvaXgW0mlXd553Q%2BetZhBOt2%2BcrL%2BPl%2FaoaQ0MLXkWeLL12aeLPaKST3C5eal%2FnrUz%2FP5QUV91utkOVFnREZUavcYylqPc4H%2BqeRJ6Nv6ji3l3tcbZpnW%2BQhIm%2BtWzguRN%2B9NDzqya3KzDkDnpGtN02cWjJA4y53Yue5Dwkkypii2slH6IL54bpfX6bpLZEgf0j7mie0KQUx%2Bl4Lfns%2F4KnYdgQBYayvZq9rFdU9T8a2lFfBR5hFPA%2FYs4vnLQ%2BGD7sSMwIVqYfgOsNzRT8iDl7QffsswvM4afhPmb7htAH1mTZA%2B4XBfL%2F0wOIOrVNNejZaqlW4ZDm%2BdInRsonD4IXCDSV9WaUivokP1o43TukHU1zSNL6Hk4a4%3D/i0P7moAMCv5I6L5I"

            } else if (skill == "Game developer") {
                webhookURL = "https://l.webhook.party/hook/ijPUJl3K8u3wLsTHqjC4fEKioPRld5SV3O1Nl982SyAi89UcTZ0fsYQTBlMH3ppm7bRN%2Baoh52baTu%2B54zuOzu8GxNvmi160DejP50Bb0MES59N6WHwbj1cvX9eZpm8xFtKDs6kabgF4ym5SqsggZUSwG%2Bq2B2IUsPH5agOgF7hij9H2bPPvcBc6r4EbxTpt5aDCYhCXoCkf9vzRTFZHelITo18YFY2FKGUMzCwBH%2BE5SB3z5NDI6qDd5RVg%2B4P7yxrFxZdxu7cqne743UsIJPA7hefdXaKkTDGbzIzvKDul8eBtUWjwGaRxDUuph%2FlWNZeaIGXBMpJj8XWJUOYh1DNK0nYsDh9AEo64aTirTv%2B8YZxLnLNJ0jQaZTI%2BKTRh6ShaLij3AKI%3D/rx7UCgkToMtG2weF"

            } else if (skill == "Entrepreneurship") {
                webhookURL = "https://l.webhook.party/hook/6RAQUkHofbLcjHBR3TisvrC94V4GQupO%2FD10iM8QjY9w1kDmJtLFlmM2v8ByGAoV1vBAQFiSPqJ6JmzpZD7Eqa2g8eMTfQG46G%2Faga6VLHn6g13PfO%2Fdg7432%2FkF1VFMEYK5aqPCyyuGHZMa4BBoKfu5B6Ne0ySFCkWtvmKclV%2BaNdTz2qxwMIYw22a3Pd5dUKtZUtuY5LQ%2FBstkPkN2CVTqgQE0UnuN4cS2PAbul5WoKMCrrwB9Li2laB7QXIOoAE9NftK48G3OXEpFrduSBH9nT86K71xWLZdkXh211Spjjh9YeV1j%2FJczpKJ%2FRqyNjooIxpyk8K35zNQ220Jm9tRlCJ%2BUkVKkDEvrDLmtuwV8YHm5isPxPhUk8cXFSJ7DGQfgzkJEoWE%3D/%2FW0GP20lvAKhIe40"

            } else if (skill == "Video Editor") {
                webhookURL = "https://l.webhook.party/hook/Ycrj842gnF3D5k87tYvf6yyrCXtDiogM2XOYAkO62dGHizh%2BFT95JyIIlJhQSpAa4H1lP78S2hP0%2FTQcLv%2Bb6TOMCrIWCVyYR%2BKxLccW4IJ52xaaalZcsAs2SBku0solrQw5KDzotyU%2FJ7CLLbhGdlFPQADrykVRp4sucbcOfiHxcP%2FszgYqbcEILN9JC0bslIyMnMF9Sk%2FjniGaR0AGPS7hDSguGpiNnTqFDjG9UgBp2kHLNY8j019y%2BrJ%2F8whWrfkrQUj9ENOryJAx%2BGxIn5XLxfTl7R6Xv%2FuBDwE7NphzPOUcU6aEaSYop2wIt6OIpqZlafDzG4sop1kqHTQlsDfwj%2F3IYReBuPOW4KbC%2FfSMYLP26HxzlrgxlQkWhuk6Hovr0LXSf3k%3D/goTY4vvk6zXTbrQJ"

            } else if (skill == "Gamer") {
                webhookURL = "https://l.webhook.party/hook/9U%2Bk7lzecrry06MOnmmutD2bY9YdaB6LX1LYzT5oFACJX1gVciZxYcqWYlpI08nSQyL5FGNssTnkdDAwKuxCpcl4vTYjkLc%2FkP%2FaOBqM33nBu5RwXJykS4CNaYBPykqUzcSarOeQgCnOZ%2BHXHb4DKM7uef%2B7dGo%2F4n%2FutgCkh1vDj12HskbhQJlz%2BWgNfW0G0qdNO%2B63B3F0dh9WR8QpRNaL9gO%2Bhd%2Be9sXlVMtn6KVoNdVfvQuqnIJvvx5UJuBLDMO45y3rUTl%2Bh7VolrxtbooR7QYn3W89jF6HHRzkGuG4CbExNzcX%2BKTeqhDLQQukmuY5NrSnbrTwVUnkvBGnaoQr3WtuLP5jLZfQgrY4ZmB3PhiGN6MuwyFMDmRxkBXsmnIZLS372SU%3D/Kwg9ywfQzibEtlsj"

            } else if (skill == "3D design") {
                webhookURL = "https://l.webhook.party/hook/sjxjEWnyjdiOl2uVfacvw4BUe6RQQzRAhShlp%2F9GC2fJo5JoMkefLqrzkyLe%2BuiHr%2FJemu7KXTas79bV68FbN30465upvw%2BeZ%2FLvKUa5VBr%2FbN%2BZFSQvWLEMKWWBjNylUZTWmkH6xEV%2BThMTCYn15nA09E6R0tWF7Btlr3k4OYIJ%2FBIVIDW0I7eFcEe917%2Bs3uOve2VVfEke0DjFE%2FLRQJkRokMDwQ%2BmTrhpqoSvGC9kxhKXwDABNkOeSKXFgJrOsPvLYQBBsNsUDX8oadZ0lNDpdcvUXynhodt%2FzopdDmZv0xzIDBs6EMQqfwP2Rq1wXZp8EOYVczSt%2FF0g3c%2FtVRFSiVHWcMifrd3HUvatHX74ItRAsQsWvMtgWDsK1Oih2sui1u2flT0%3D/HDjWGL%2BCUdoqsjWH"

            } else if (skill == "Robotics") {
                webhookURL = "https://l.webhook.party/hook/PpuKwOuMfeJadXclXhLZU6YsE2Ye3vt1wgWFYpUn8KMScWTeUfMOwX0G6jVGuA%2FtxAmAY1U19w2RoaFgtHkVN%2BVA1Kke5pDSnxRjrTEu5gCGmsGG6rIZE%2BORBq0%2BXq%2FGDjOK33ebsX1dkfdJJcHfjPYeK%2B1CxxhR6kQjfZtY4MmPSlWX0R7IatZNLo0pFiK%2B715ow2fer1hSjR7rXyj7fcz8VnIoJ9HHaF4WEdK8JcJMNs0Myak1wlNuoxicWS4T0dsyPtbJaqnAWouANHFifPq6nrHILKQ5A6KI1FI9ST330DjiZU9k%2BfNUiIQG8oLYGgE6ODoJd6%2BGTTGR7WMQBlW5N0IBIZwgkCwb4iwxKx%2Fb4UoVJJI%2Fyp%2FjPWd2gloTfPAZEOiHp8U%3D/m9szt1wXDvGzkQdC"

            } else if (skill == "Film Making") {
                webhookURL = "https://l.webhook.party/hook/bNrfd2Bp46tboOgUM%2BEZki0oz2H6060VO5wPlapQM%2BvDX7Dl2RIBq%2BxuW5sRH3%2F81QNCSy4jTnXEDIAiG1Ce7KTCgBJoDn6l1MbWn0sHkujTrbYRbPLgKsSh%2BI2LfEI2%2FZ4FYUrGLQIOfpRtp62ZA57Jv6wt0AjwoJRo84iMdlfsDSvrECJa2%2BxBx1k0B6vcptPYXIkB67%2F6qy%2FaqQcJJlsIFJasi8AAx60XfexXsSlaTMtaAXvTgFmVe8LFK3NPP1BGAgguAnA1%2F7wW%2FvEs9WWYMP%2FO6pRTurvMK%2BJTJQ4kvxMD6RJEeFL%2BGpLjB4txtqzceWBna9FTLS%2Fn5NE3HKXtsBOKIYfz8myMMPliqRPPV4caw%2BDl5IlN2BobQRIWKUEbXisj0bk%3D/cJl3dS9thCcQcc69"

            } else if (skill == "Acting") {
                webhookURL = "https://l.webhook.party/hook/AvpdQtkqJyWiLXnX0DmFwru8zfLLsma8Tp6g6bu4Gazkx%2F6rxfDZPMmOVAamJQXq5mntoZ3pRdQmEzp7fcMPeTSSDcX6S2NAGngJcGK%2BV%2FNfrvo%2BqE1vBeCpzwrwrVypjSG0MF3omw8L3JcT6K9e9URRQmTCzCGX2Gm9nsHTOExdOggyHG3sCgppYUtFaXjnlEJUPuafcyBFwZSMfsGpADubDZn1HMMal3JDwG2hiNJXmbTURSVlkdg3WPlINCZvtGYYSHOPLn42SsZt6yEDPA5LMRtdsPHBMwRCYZpdPJQ57VYIrCChTUrBJtbkvLRbsHmoIfydQkp%2FYBPdOE81kpHK%2F3bY9Nq1u4Pj5rCOMD%2BjaR3A%2FJp%2BdeBkd8Csnpy023D2P%2FtsME8%3D/3w1iIOWo%2F%2FHWlkVL"

            } else if (skill == "Not Sure") {
                webhookURL = "https://l.webhook.party/hook/EW%2FU9G7B4N67eLf9WbAx3J3WhNXuMWhSBR99t1NPwC3Ey8QdkWuKG%2F8vkyPLZEn87K7mPhoy6QZ3TOzzzbv1ocmst3ZwiMP4PoViU%2FaqbrmXhSbtzHDUaB7vJschSsdggyz%2FK7BRlEVc%2F4i91WJbQI5D22brH%2BKnW8z2jk1zN6sffgtlIwtrQadcJGNUrbo5F%2BYIo7uwYgCzELKaBWGaKNXNkIRNUL9ruJG1ya4p%2BQIc2q3h9oaA%2BslOWHN3Xq2Khbs6z9jOUD3DynOVesQeUwRTOKGsLudRm2h%2BFR8dJFrKL8OiZdVifA%2FRgZQQ6OGcb5az4FWpGT8MwIE5nqiKTyh%2BYhtvmXr06dN4m8MQQyDC77AjAtckj8HouX2T6VlCls4Mlh9qFFE%3D/d%2F2VGWBSU1XTctJ2"

            }

            await db.collection("tasks").doc(skill).collection("tasks").add({
                taskName,
                promptLink,
                deadline,
                currentTime,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            payload = {
                embeds: [
                    {
                        color: 0x67A9E4,
                        fields: [
                            {
                                name: "📝 Title",
                                value: `**${taskName}**`,
                            },
                            {
                                name: "🔗 Prompt Link",
                                value: `[Open Prompt](${promptLink})`,
                            },
                            {
                                name: "🗓️ Deadline",
                                value: `> ${deadline}, 11:59PM`,
                                inline: true
                            },
                            {
                                name: "⏰ Posted At",
                                value: `> ${currentTime}`,
                                inline: true
                            }
                        ],
                        footer: {
                            text: skill + " Task | Byte Club",
                        },
                        timestamp: new Date().toISOString()
                    }
                ]
            };

            fetch(webhookURL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    alert(`Alert Sent to: ${skill} members`)
                } else {
                    console.log("Failed to send webhook message.");
                }
            }).catch(err => {
                console.error("Webhook error:", err);
            });
        }
        alert("Task added to all clicked skill categories!");
        this.reset(); // reset form after submit
        document.querySelectorAll(".skill.clicked").forEach(el => el.classList.remove("clicked")); // reset skill buttons
        addTask.style.pointerEvents = "none"
        addTask.style.opacity = "0"
        location.reload();
    } catch (error) {
        console.error("Error adding task:", error);
        alert("There was an error. Check console.");
    }
});



// pull data ------------------


// You should already have Firebase initialized with Firestore (from previous step)

const currentTasksContainer = document.getElementById("currentTasks");
const previousTasksContainer = document.getElementById("previousTasks");

const skills = [
    "Programming", "Web Development", "Motion Design", "Graphic Design",
    "Cryptic", "Photographer", "Group Discussion", "Quizzer",
    "Game developer", "Entrepreneurship", "Video Editor", "Gamer",
    "3D design", "Robotics", "Film Making", "Acting", "Not Sure"
];

async function fetchTasksForUser() {
    currentTasksContainer.innerHTML = "";
    previousTasksContainer.innerHTML = "";

    const today = new Date();
    const tasks = [];

    for (const skill of skills) {
        const tasksRef = firebase.firestore()
            .collection("tasks")
            .doc(skill)
            .collection("tasks");

        try {
            const snapshot = await tasksRef.get();
            snapshot.forEach(doc => {
                const task = doc.data();
                const taskId = doc.id;
                const deadlineDate = new Date(task.deadline);

                tasks.push({
                    ...task,
                    id: taskId,
                    deadlineDate,
                    isUpcoming: deadlineDate >= today,
                    skill: skill
                });
            });

        } catch (error) {
            console.error(`Error fetching tasks for ${skill}:`, error);
        }
    }


    tasks.sort((a, b) => b.deadlineDate - a.deadlineDate);
    console.log(tasks)

    tasks.forEach(task => {
        const taskBox = document.createElement("div");
        taskBox.className = "taskBox";
        taskBox.innerHTML = `
                    <div class="statHeading">
                        <div class="statIcon">
                            <i class="bi bi-file-earmark-text"></i>
                        </div>
                        <span>${task.taskName}</span>
                        <div class="deleteIcon" onclick="deleteTask('${task.skill}', '${task.id}')">
                            <i class="bi bi-trash"></i>
                        </div>
                    </div>
                    <div class="taskSkill">
                        <div class="skill">${task.skill}</div>
                    </div>
                    <div class="taskLink">
                        <a href="${task.promptLink}" target="_blank">
                            ${task.promptLink}
                        </a>
                    </div>
                    <div class="taskFooter">
                        <span>${formatDate(task.deadlineDate)}</span>
                        <div class="submitTask" onclick="viewSubmissions('${task.skill}', '${task.id}')">Submissions</div>
                    </div>
                `;

        if (task.isUpcoming) {
            currentTasksContainer.appendChild(taskBox);
        } else {
            previousTasksContainer.appendChild(taskBox);
        }
    });
}

// Helper to format date as "MMM DD, h:mm A"
function formatDate(date) {
    const month = date.toLocaleString('en-US', { month: 'short' }); // May
    const day = date.getDate(); // 10
    return `${month} ${day}, 11:59 PM`;
}

async function deleteTask(skill, taskId) {
    const confirmDelete = confirm("Are you sure you want to delete this task and all associated scores?");

    if (!confirmDelete) return;

    try {
        // 1. Get a reference to the Realtime Database
        const rtdb = firebase.database();

        // 2. Fetch all members from the Realtime Database
        const membersSnapshot = await rtdb.ref("members").once("value");
        const membersData = membersSnapshot.val();

        const scoreDeletionPromises = [];

        // 3. Iterate through members and find/delete scores for this task
        if (membersData) {
            for (const uid in membersData) {
                if (membersData.hasOwnProperty(uid)) {
                    const userData = membersData[uid];
                    // Check if the member has taskScores and if a score exists for this taskId
                    if (userData.taskScores && userData.taskScores[taskId] !== undefined) {
                        console.log(`Deleting score for user ${uid} for task ${taskId}`);
                        // Add the deletion promise to the array
                        scoreDeletionPromises.push(
                            rtdb.ref(`members/${uid}/taskScores/${taskId}`).remove()
                        );
                    }
                }
            }
        }

        // 4. Wait for all score deletions to complete
        if (scoreDeletionPromises.length > 0) {
            console.log(`Attempting to delete ${scoreDeletionPromises.length} scores...`);
            await Promise.all(scoreDeletionPromises);
            console.log("All associated scores deleted from Realtime Database.");
        } else {
            console.log("No associated scores found in Realtime Database for this task.");
        }


        // 5. Delete the task document from Firestore
        console.log(`Deleting task ${taskId} from Firestore under skill ${skill}`);
        await firebase.firestore()
            .collection("tasks")
            .doc(skill)
            .collection("tasks")
            .doc(taskId)
            .delete();
        console.log("Task document deleted from Firestore.");

        alert("Task and all associated scores deleted successfully.");

        // 6. Refresh the task list on the page
        // Assuming fetchTasksForUser() is defined and available in this scope
        if (typeof fetchTasksForUser === 'function') {
            fetchTasksForUser();
        } else {
            // If fetchTasksForUser is not available (e.g., in submissions.html),
            // you might need a different refresh logic, like reloading the page
            // window.location.reload(); // Use this if fetchTasksForUser is not global/available
            // Or redirect if it's the admin dashboard page
            window.location.href = "../admindashboard.html";
        }


    } catch (error) {
        console.error("Error during task or score deletion:", error);
        alert("Failed to delete task or associated scores. Check console for details.");
    }
}


// Call on page load
fetchTasksForUser();

function logoutFirebase() {
    firebase.auth().signOut().then(function () {
        console.log('Signed Out');
        alert("bye")
        window.location.href = "../joinlogin.html";
    }, function (error) {
        console.error('Sign Out Error', error);
    });
}

function viewSubmissions(skill, taskId) {
    const url = `submissions.html?skill=${encodeURIComponent(skill)}&taskId=${encodeURIComponent(taskId)}`;
    window.location.href = url;
}
