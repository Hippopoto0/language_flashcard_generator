import { useState } from 'react'
import { motion } from "motion/react"
import './App.css'

function App() {
  const possibleLanguages = ["English", "Mandarin", "Hindi", "Spanish", "French",
        "Arabic", "Bengali", "Russian", "Portuguese", "Urdu",
        "Indonesian", "German", "Japanese", "Swahili", "Marathi"]

  const [currentLang, setLang] = useState("Spanish");

  const [isResponseRevealed, setResponseRevealed] = useState(false);

  const [csvData, setCSVData] = useState("")

  async function getFlashcards() {
    try {
      const response = await fetch(`http://localhost:8080/${encodeURIComponent(currentLang)}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response;
      console.log(response)
      const jsonResp: any = data.json()
      console.log(await jsonResp)
      return jsonResp
    } catch (error) {
      console.error("Failed to fetch flashcards:", error);
    }
  }

  async function handleFlashcardsCreation(event: React.MouseEvent) {
    event.preventDefault(); // Prevent form submission
    setResponseRevealed(true);
    const data = await getFlashcards();
    getCSVFromGeminiJSON(data)
  }

  // async function handleFlashcardsCreationTest(event: React.MouseEvent) {
  //   event.preventDefault(); // Prevent form submission
  //   // getFlashcards();
  //   const data = await import('./geminiResponseExample.json'); // Dynamically import the JSON
  //   setResponseRevealed(true);
  //   setTimeout(() => {
  //     console.log(data)
  //     getCSVFromGeminiJSON(data)

  //   }, 10000)
  // }

  function getCSVFromGeminiJSON(jsonData: any) {
    console.log(jsonData)
    let csvData = jsonData["gemini_response"]["candidates"][0]["content"]["parts"][0]["text"].replace("```csv", "").replace("```", "")

    setCSVData(csvData)
    console.log(csvData)
  }

  const downloadCSV = () => {
    // Create a Blob from the csvData
    const blob = new Blob([csvData], { type: 'text/csv' });

    // Create a link element
    const link = document.createElement('a');

    // Set the download attribute with the desired filename
    link.download = 'translations.csv';

    // Create an object URL for the Blob
    link.href = URL.createObjectURL(blob);

    // Programmatically trigger a click event on the link to start the download
    link.click();
  };

  return (
    <main className='w-full h-screen bg-orange-100 flex items-center justify-center relative overflow-hidden'>
      <section className='max-w-[95vw] w-[30rem] h-full flex items-center justify-center flex-col'>
        <form action="" className='w-full'>

          <textarea placeholder='Say some stuff about yourself!' name="" id="" className='w-full h-[20rem] bg-white rounded-2xl p-4 resize-none outline-0 text-slate-900 focus-within:shadow-lg transition-all duration-300 focus-within:border-b-2 border-gray-200'></textarea>
          <div className='w-full flex items-center justify-between mt-2'>
            <div className="dropdown dropdown-top">
              <div tabIndex={0} role="button" className="btn btn-dash text-slate-800 hover:text-white m-1">
                {currentLang}
                <div>^</div>
              </div>
              <ul tabIndex={0} className="dropdown-content menu bg-white btn-dash rounded-box z-[1] w-52 max-h-[20rem] p-2 shadow text-accent-content">
                {possibleLanguages.map((lang, _) => 
                  <li><a href="#" onClick={() => setLang(lang)}>{lang}</a></li>
                )}
              </ul>
            </div>
            <button className="btn ml-auto" onClick={(e) => handleFlashcardsCreation(e)}>Create Flashcards!</button>
          </div>
        </form>
      </section>
      <motion.section
        animate={{ y: isResponseRevealed ? "0%" : "100%"}}
        initial={{ y: "100%"}}
        transition={{ duration: 1}}
        className=' z-[10] absolute w-full h-screen bg-gradient-to-t from-orange-100 to-transparent via-orange-100 flex items-center justify-center'>
          <motion.div
            animate={{ opacity: isResponseRevealed ? "100%" : "0%", y: 0 }}
            initial={{ opacity: "0%", y: 20 }}
            transition={{ delay: 1 }}
            className='relative h-full w-[40rem] flex flex-col items-center'>
            <div className='mt-20'></div>
            <h1 className='text-slate-800 font-bold'>
              {csvData != "" ?
                "I came up with a bunch of sentences suited to you!"
              : "I'm coming up with a bunch of sentences suited to you!"
              }
            </h1>

            <div className="overflow-x-auto mt-4 w-full max-h-[30rem] h-[20rem] rounded-2xl relative flex justify-center">
              { csvData != "" ?
              <>
              <table className="table table-sm text-slate-800 bg-amber-200 max-h-52 rounded-2xl">
                {/* head */}
                <thead className='text-slate-800'>
                {csvData.split("\n")[0].split("|").map(text =>
                  <th className='font-bold'>
                    {text}
                  </th>
                )}
                </thead>
                <tbody className=' h-52 rounded-2xl'>
                  {csvData.split("\n").slice(1).map(rowData =>
                    <tr>
                      {
                        rowData.split("|").map(text =>
                          <td>{text}</td>
                        )
                      }
                    </tr>
                  )}
                  {/* <tr>
                    <th>1</th>
                    <td>Cy Ganderton</td>
                    <td>Quality Control Specialist</td>
                  </tr>
                  <tr>
                    <th>2</th>
                    <td>Hart Hagerty</td>
                    <td>Desktop Support Technician</td>
                  </tr>
                  <tr>
                    <th>3</th>
                    <td>Brice Swyre</td>
                    <td>Tax Accountant</td>
                  </tr> */}
                </tbody>
              </table>

              <div className='fixed translate-y-[10rem] w-[40rem] h-[10rem] bg-gradient-to-t from-orange-100 to-transparent via-orange-100'></div>
              </>
              : <div id='loading-anim' className='bg-red-400 w-12 h-12 mt-4'>

              </div>
              }
            </div>
            <motion.button
              initial={{ opacity: 0, translateY: 10 }}
              animate={csvData != "" ? { opacity: 1, translateY: 0 } : { opacity: 0, translateY: 10 }}
              onClick={downloadCSV}
              className='btn mt-4'>Download CSV
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5 font-bold stroke-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              </motion.button>
          </motion.div>
      </motion.section>
    </main>
  )
}

export default App
