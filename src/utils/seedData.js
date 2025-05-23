import { db } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

/**
 * Add sample articles to Firestore
 * @returns {Promise<Array>} - Array of added article IDs
 */
export async function seedArticles() {
  const articlesRef = collection(db, 'articles');
  const articleIds = [];
  
  // Sample articles
  const articles = [
    {
      title: 'Market Update: Stocks Rally on Economic Data',
      content: `The stock market rallied today following the release of better-than-expected economic data. The S&P 500 gained 1.2%, while the Nasdaq Composite rose 1.5%.

Investors were encouraged by the latest jobs report, which showed that the economy added 250,000 jobs last month, exceeding economists' expectations of 220,000. The unemployment rate remained steady at 3.6%.

"This is a Goldilocks scenario for the market," said Jane Smith, chief market strategist at XYZ Investments. "The job market is strong enough to support economic growth, but not so hot that it would force the Federal Reserve to become more aggressive with interest rate hikes."

Treasury yields fell slightly on the news, with the 10-year yield dropping to 3.8% from 3.85% the previous day.

Technology stocks led the gains, with major tech companies seeing significant increases in their share prices. Financial stocks also performed well, benefiting from the positive economic outlook.

Analysts are now looking ahead to next week's inflation data, which will provide further insight into the Fed's potential actions in the coming months.`,
      category: 'markets',
      publication_date: new Date(),
      likes: 42
    },
    {
      title: 'Federal Reserve Signals Potential Rate Cut',
      content: `The Federal Reserve has signaled that it may be ready to cut interest rates in the coming months, a significant shift in policy that could have far-reaching implications for the economy and financial markets.

In a speech yesterday, Federal Reserve Chair indicated that the central bank is closely monitoring economic data and is prepared to adjust its policy stance if necessary.

"We are seeing signs that inflation is moderating, and we want to ensure that we don't keep policy too tight for too long," the Fed Chair stated. "Our goal is to achieve a soft landing for the economy."

The comments come after several months of declining inflation figures, with the latest Consumer Price Index (CPI) showing a 3.2% annual increase, down from over 9% at its peak last year.

Markets reacted positively to the news, with the Dow Jones Industrial Average rising over 400 points. Bond yields fell sharply, with the 2-year Treasury yield, which is particularly sensitive to Fed policy expectations, dropping to its lowest level in several months.

Economists are now predicting that the Fed could begin cutting rates as early as September, with some forecasting up to three quarter-point cuts by the end of the year.

"This is a significant pivot from the Fed," said John Doe, chief economist at ABC Financial. "It suggests that they believe they've made substantial progress in their fight against inflation and are now turning their attention to supporting economic growth."

The potential rate cuts would be welcome news for borrowers, potentially leading to lower mortgage rates, auto loans, and credit card interest rates. However, savers might see lower returns on their deposits.`,
      category: 'economy',
      publication_date: new Date(Date.now() - 86400000), // Yesterday
      likes: 28
    },
    {
      title: 'Tech Giant Announces Revolutionary AI Product',
      content: `A leading technology company has unveiled what it describes as a "revolutionary" artificial intelligence product that could transform how businesses operate and people interact with technology.

The new AI system, called "IntelliCore," is designed to integrate seamlessly with existing business processes and provide advanced analytics, automation, and decision-making capabilities.

"This is not just an incremental improvement in AI technology," said the company's CEO during the product launch event. "IntelliCore represents a fundamental leap forward in what AI can do for businesses and consumers."

The system is built on a new type of neural network architecture that allows it to process and analyze data more efficiently than previous AI models. It can also learn from smaller datasets, making it accessible to businesses that don't have vast amounts of data.

Key features of IntelliCore include:

- Advanced natural language processing that can understand context and nuance in human communication
- Predictive analytics that can forecast trends and identify potential issues before they occur
- Automated decision-making capabilities that can handle routine business processes
- Integration with existing software systems and databases

Industry analysts have responded positively to the announcement, with many suggesting that IntelliCore could give the company a significant competitive advantage in the rapidly growing AI market.

"This appears to be a genuine breakthrough," said Sarah Johnson, a technology analyst at DEF Research. "If IntelliCore delivers on its promises, it could set a new standard for enterprise AI systems."

The company's stock rose 8% following the announcement, adding billions to its market capitalization.

IntelliCore will be available to enterprise customers next quarter, with a consumer version planned for release later in the year.`,
      category: 'technology',
      publication_date: new Date(Date.now() - 172800000), // 2 days ago
      likes: 75
    }
  ];
  
  // Add each article to Firestore
  for (const article of articles) {
    try {
      const docRef = await addDoc(articlesRef, article);
      articleIds.push(docRef.id);
      console.log('Added article with ID:', docRef.id);
    } catch (error) {
      console.error('Error adding article:', error);
    }
  }
  
  return articleIds;
}

/**
 * Call this function from the browser console to seed the database with sample data
 */
window.seedDatabase = async function() {
  try {
    const articleIds = await seedArticles();
    console.log('Database seeded successfully!');
    console.log('Added article IDs:', articleIds);
    return articleIds;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};