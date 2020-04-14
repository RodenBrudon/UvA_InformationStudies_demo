DOM = {
    analysis: document.querySelector('.output1'),
    plainText: document.querySelector('.output2'),
    histogram: document.querySelector('.output3')
};

class TextAnalyzer {

    texts = {};
    wordFreqsPerArticle = {};
    wordQueryOutput = [];

    allTextsInOne = {};
    wordFreqsAllArticles = {};
    
    
    // ***** Handle data
    //get artcles from DOM
    getArticles = () => {
        this.articles = [...document.getElementsByTagName("text")];
    }

    // clean text in article
    cleanText = (s) => {
        // Normalize
        s = s.toLowerCase();
        // Strip quotes and brackets
        s = s.replace(/["“”(\[{}\])]|\B['‘]([^'’]+)['’]/g, '$1');
        // Strip dashes and ellipses
        s = s.replace(/[‒–—―…]|--|\.\.\./g, ' ');
        // Strip punctuation marks
        s = s.replace(/[!?;:.,]\B/g, '');
        // remove html tags [<p>, </p>]
        s = s.replace(/<p>/g, '');
        s = s.replace(/<\/p>/g, '');
        return s;
    }

    getWordsfromArticle = (s, i) => {
        s = this.cleanText(s);
        this.texts[i] = s;    
    }

    // store texts of every article
    storeWordsfromArticles = (articlesObject) => {
        Object.keys(articlesObject).forEach(articleKey => {
            this.getWordsfromArticle(articlesObject[articleKey].innerHTML, parseInt(articleKey)+1)   
        });
    }

    // calc word frequency in individual article text
    calcWordFreq = (s, i, storeFreqs) => {
        // this.wordFreqsPerArticle 
        storeFreqs[i] = s.match(/\S+/g).reduce(function(oFreq, sWord) {
          if (oFreq.hasOwnProperty(sWord)) ++oFreq[sWord];
          else oFreq[sWord] = 1;
          return oFreq;      
        }, {});
    }

    //store word frequency of every article
    storeFreqsfromTexts = (textsObject, storeFreqs) => {
        Object.keys(textsObject).forEach(textKey => {
            this.calcWordFreq(textsObject[textKey], textKey, storeFreqs);
        })
    }

    // ***** Handle word query, example: [the] -> [1, 20] -> [2, 34] -> [3, 12]
    // check for presence of a word in an object
    isWordInSet = (word, set) => {
        return (word in set);
    }

    // create outpur arrays showing location and frequency of the word
    showIfWordInSet = (word, article, wordset) => {
        const isIncl = this.isWordInSet(word, article);
        if(isIncl){
            let arr = [wordset, article[`${word}`]];
            this.wordQueryOutput.push(arr);
            } 
        }
    
    // crate hashtable as response to word query
    showWordInSets = (word, sets) => {
        this.wordQueryOutput.push(word);
        Object.keys(sets).forEach(wordSet =>{
            this.showIfWordInSet(word, sets[wordSet], wordSet);
        })
    }

    renderOutputToDom = (output) => {
        const element = 
        `<p>
        The word "${output[0]}" occurs in article ${output[1][0]}: ${output[1][1]} times, </br>
        in article ${output[2][0]}: ${output[2][1]} times and </br>
        in article ${output[3][0]}: ${output[3][1]} times. 
        In total it occurs ${output[1][1]+output[2][1]+output[3][1]}.
        </p>`
        DOM.analysis.innerHTML = element;
    }

    analyze = (word) => {
        this.getArticles();
        this.storeWordsfromArticles(this.articles);
        this.storeFreqsfromTexts(this.texts, this.wordFreqsPerArticle);
        this.showWordInSets(word, this.wordFreqsPerArticle);
        this.renderOutputToDom(this.wordQueryOutput);
    }

    // ***** histogram
    // plain texts
    allTexts = (out) => {
        const keys = Object.keys(this.articles);
        keys.forEach(key => {
            out.appendChild(this.articles[key]);
            })
        out.innerHTML = this.cleanText(out.innerHTML);
        this.allTextsInOne = this.cleanText(out.innerHTML);
        //remove remaining html tags and numbers
        this.allTextsInOne = this.allTextsInOne.replace(/<text>/g, '');
        this.allTextsInOne = this.allTextsInOne.replace(/<\/text>/g, '');
        this.allTextsInOne = this.allTextsInOne.replace(/[0-9]/g, '');
        this.calcAllFreq(this.allTextsInOne);
        
    }

    calcAllFreq = (s) => {
        this.wordFreqsAllArticles = s.match(/\S+/g).reduce(function(oFreq, sWord) {
                  if (oFreq.hasOwnProperty(sWord)) ++oFreq[sWord];
                  else oFreq[sWord] = 1;
                  return oFreq;      
                }, {});
    }

    renderHistogram = (DOMhistogram) => {
        // transform object to array
        const result1 = Object.keys(this.wordFreqsAllArticles).map((key) => {          
            return [this.wordFreqsAllArticles[key]];     
        }); 
        const arrRes = result1.map(el => {
            return el[0];
        })
        // create histogram
        // const wordArr = this.allTextsInOne.match(/\S+/g);

        const x = arrRes;
        const trace = {
            x: x,
            type: 'histogram',
            
        };
        const data = [trace];
        Plotly.newPlot(DOMhistogram, data);
    }

}

const analysis = new TextAnalyzer();
analysis.analyze('and');
analysis.allTexts(DOM.plainText);
analysis.renderHistogram(DOM.histogram);




