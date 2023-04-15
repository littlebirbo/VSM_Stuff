let index = [];
let documentInfo = [];
let averageDocLen = 0;
let stopWords = [];
let similarities = [];

const addDocument = (docId, docTitle, content, tags, title, thumbnail) => {
    const strinifiedTags = JSON.stringify(tags);
    const trimmedTitle = title ? title.toString().replace(/\p{P}/gu, " ").replace(/\s+/gu, " ").trim().toLowerCase() : "";
    const trimmedContent = (content + " " + trimmedTitle + " " + strinifiedTags).replace(/\p{P}/gu, " ").replace(/\s+/gu, " ").trim().toLowerCase();

    let tokenArray = trimmedContent.split(" ");
    let docContent = [];

    for (let i = 0; i < tokenArray.length; i++) {

        if (stopWords.includes(tokenArray[i])) {
            continue;
        }

        docContent.push(tokenArray[i]);

        if (!index.hasOwnProperty(tokenArray[i])) {
            index[tokenArray[i]] = {
                df: 1,
                documents: { [docId]: 1 },
            };
        } else {
            if (index[tokenArray[i]].documents.hasOwnProperty(docId)) {
                index[tokenArray[i]].documents[docId]++;
            } else {
                index[tokenArray[i]].documents[docId] = 1;
                index[tokenArray[i]].df++;
            }
        }
    }

    documentInfo[docId] = {
        title: docTitle,
        game_title: title,
        description: content,
        thumbnail: thumbnail,
        tags: tags,
        content: [...new Set(docContent)],
    };

    let tmp = averageDocLen * (Object.keys(documentInfo).length - 1);
    tmp = tmp + documentInfo[docId].content.length;
    let avg = tmp / Object.keys(documentInfo).length;

    averageDocLen = avg;
};

const removeDocument = (docId) => {
    try {
        // Delete the document from the index
        for (let word in index) {
            // Check if the document has property query and delete it
            if (index[word].documents.hasOwnProperty(docId)) {
                delete index[word].documents[docId];
                index[word].df--;
            }
        }
    }
    catch (error) {
        console.error(error);
        return;
    }

};

const calculateSimilarities = ({
    queryLen,
    similarities
}) => {
    queryLen = Math.sqrt(queryLen);
    let similaritiesCounter = 0;

    for (let docId_j in similarities) {
        similaritiesCounter++;

        let documentLenResult = calculateDocumentLength(docId_j);
        similarities[docId_j] = similarities[docId_j] / (queryLen * documentLenResult);

        if (similaritiesCounter % 50 == 0) {
            let tmp = Object.entries(similarities).sort((a, b) => b[1] - a[1]).filter((similarity) => similarity[0].toLowerCase() !== "query").slice(0, 5);

            tmp = tmp.map((similarity) => {
                let docId = similarity[0];
                let chance = similarity[1];
                return {
                    docId: docId,
                    chance: chance,
                    title: documentInfo[docId].title,
                    game_title: documentInfo[docId].game_title,
                    description: documentInfo[docId].description,
                    content: documentInfo[docId].content,
                    thumbnail: documentInfo[docId].thumbnail,
                    tags: documentInfo[docId].tags,
                };
            });

            postMessage({
                action: "progress",
                message: `Processing similarities: ${similaritiesCounter} / ${Object.keys(similarities).length}`,
                progress: (similaritiesCounter / Object.keys(similarities).length) * 100,
                relevantItems: tmp,
            });
        }

        // At the last iteration, sort the similarities and resolve the promise
        if (similaritiesCounter === Object.keys(similarities).length) {
            // Sort similarities by value
            similarities = Object.entries(similarities).sort((a, b) => b[1] - a[1]);

            similarities = similarities.map((similarity) => {
                let docId = similarity[0];
                let chance = similarity[1];
                return {
                    docId: docId,
                    chance: chance,
                    title: documentInfo[docId].title,
                    game_title: documentInfo[docId].game_title,
                    description: documentInfo[docId].description,
                    content: documentInfo[docId].content,
                    thumbnail: documentInfo[docId].thumbnail,
                    tags: documentInfo[docId].tags,
                };
            });

            return similarities;
        }
    }
};

const search = (query) => {
    similarities = [];
    // Remove the query document from the index only if it exists
    removeDocument("query");

    return new Promise(async (resolve, reject) => {
        addDocument("query", "Query", query);
        let queryLen = 0;

        query = query.replace(/\p{P}/gu, " ").replace(/\s+/gu, " ").trim().toLowerCase();

        let tokenArray = query.split(" ");
        let documentLen = [];

        tokenArray = [...new Set(tokenArray)];

        for (let i = 0; i < tokenArray.length; i++) {
            if (stopWords.includes(tokenArray[i])) {
                if (i === tokenArray.length - 1) {
                    resolve(
                        calculateSimilarities({
                            queryLen,
                            similarities
                        })
                    );
                }
                continue;
            }
            let currentWord = tokenArray[i];
            let tf_qi = index[currentWord]["documents"]["query"] ? index[currentWord]["documents"]["query"] : 1;
            let df_i = index[currentWord]["df"];

            let w_qi = calculateQueryWeight_BM25(tf_qi, df_i, "query");

            queryLen = queryLen + w_qi * w_qi;
            let indexCounter = 0;
            for (let docId_j in index[currentWord]["documents"]) {
                if (indexCounter % 100 === 0) {
                    postMessage({
                        action: "progress",
                        message: `Calculating document weight for: ${currentWord} - ${indexCounter} / ${Object.keys(index[currentWord]["documents"]).length}`,
                        progress: (indexCounter / Object.keys(index[currentWord]["documents"]).length) * 100,
                        relevantItems: []
                    });
                }
                indexCounter++;
                if (!similarities.hasOwnProperty(docId_j)) {
                    similarities[docId_j] = 0;
                    documentLen[docId_j] = 0;
                }

                let tf_ji = index[currentWord]["documents"][docId_j];
                let w_ji = calculateDocumentWeight_BM25(tf_ji, df_i, docId_j);

                similarities[docId_j] = similarities[docId_j] + w_qi * w_ji;
            }

            // Resolve the promise at the last iteration
            if (i === tokenArray.length - 1) {
                resolve(
                    calculateSimilarities({
                        queryLen,
                        similarities
                    })
                );
            }
        }
    });
};

const calculateDocumentLength = (docId) => {
    const wordArray = documentInfo[docId]["content"];
    let sum = 0;
    for (let i = 0; i < wordArray.length; i++) {
        const tf = index[wordArray[i]]["documents"][docId];
        const df = index[wordArray[i]]["df"];
        const w_i = calculateDocumentWeight_BM25(tf, df, docId);
        sum += w_i * w_i;
    }
    return Math.sqrt(sum);
};

const calculateQueryWeight = (tf_iq, df_i) => {
    const tf = 1 + Math.log(tf_iq);
    const idf = Math.log((Object.keys(documentInfo).length + 1) / df_i);
    return tf * idf;
};

const calculateQueryWeight_BM25 = (tf_i, df_i, docId) => {
    const k1 = 1.2;
    const s = 0.2;
    const docLen = documentInfo[docId]["content"].length;

    const tf =
        ((k1 + 1) * tf_i) /
        (k1 * (1 - s + s * (docLen / averageDocLen)) + tf_i);
    const idf = Math.log(1 + Object.keys(documentInfo).length / df_i);

    return tf * idf;
};

const calculateDocumentWeight = (tf_ji, df_i) => {
    const tf = 1 + Math.log(tf_ji);
    const idf = Math.log((Object.keys(documentInfo).length + 1) / df_i);
    return tf * idf;
};

const calculateDocumentWeight_BM25 = (tf_i, df_i, docId) => {
    const k1 = 1.2;
    const s = 0.2;
    const docLen = documentInfo[docId]["content"].length;

    const tf =
        ((k1 + 1) * tf_i) /
        (k1 * (1 - s + s * (docLen / averageDocLen)) + tf_i);
    const idf = Math.log(1 + Object.keys(documentInfo).length / df_i);

    return tf * idf;
};

/**
 * 
 * @param {string} filename - The filename of the JSON file to load
 * @param {number} limit - The number of documents to load
 */
const loadDocuments = (filename, limit = 0) => {
    return new Promise(async (resolve, reject) => {
        // Reset 
        index = {};
        documentInfo = {};
        averageDocLen = 0;
        similarities = [];

        const fileDir = `./${filename}`;

        // Read the file with the data
        const dataFile = await fetch(fileDir);

        // Parse the data
        const data = await dataFile.json();

        // Read the stopwords
        const stopWordsFile = await fetch("./stopwords.txt");
        const stopWordsText = await stopWordsFile.text();

        // Set the stopwords
        stopWords = stopWordsText.split("\n");

        // Load the first 5000 apps
        const apps = (!isNaN(limit) && limit !== 0) ? data.apps.slice(0, limit) : data.apps;

        for (let i = 0; i < apps.length; i++) {
            let app = data.apps[i];
            if (!app.description) {
                app.description = " ";
            }
            if (!app.tags) {
                app.tags = [];
            }
            if (!app.title) {
                app.title = " ";
            }
            if(!app.thumbnail) {
                app.thumbnail = "./gallery/app_banner_placeholder.png";
            }

            addDocument(`doc_${app.app_id}`, app.app_id, app.description, app.tags, app.title, app.thumbnail);

            if (i % 200 === 0) {
                postMessage({
                    action: "progress",
                    message: `Loaded ${i} of ${apps.length} documents`,
                    progress: (i / apps.length) * 100,
                });
            }

            // Resolve the promise when the last iteration is done
            if (i == apps.length - 1) {

                resolve({
                    index,
                    documentInfo,
                    averageDocLen,
                    stopWords,
                });
            }
        }
    });
};

const isLoaded = () => {
    return Object.keys(index).length > 0;
};

self.onmessage = async (message) => {
    const { action, query, forced } = message.data;

    switch (action) {
        case "load": {
            const { file, maxDocuments } = message.data;

            if (isLoaded() && !forced) {
                return postMessage({
                    action: "loaded",
                    message: "Already loaded"
                });
            }
            loadDocuments(file, maxDocuments)
                .then((documents) => {
                    postMessage({
                        action: "loaded",
                        message: "Loaded",
                        documents,
                    });
                });
            break;
        }
        case "search": {
            index = message.data.index;
            documentInfo = message.data.documentInfo;
            averageDocLen = message.data.averageDocLen;
            stopWords = message.data.stopWords;

            if (!isLoaded()) {
                return postMessage({
                    action: "error",
                    message: "Documents are not loaded"
                });
            }
            search(query)
                .then((similarities) => {
                    postMessage({
                        action: "progress",
                        message: `Similarity search complete`,
                        progress: 100,
                        relevantItems: similarities,
                    });

                    setTimeout(() => {
                        postMessage({
                            action: "completed",
                            message: "Searched",
                            similarities,
                        });
                    }, 500);
                });
            break;
        }
        default: {
            postMessage({
                action: "error",
                message: "Unknown action"
            });
            break;
        }
    }
};
