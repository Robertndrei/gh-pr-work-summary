'use client';

import { useState } from "react";

export interface Summary {
  authors: string[],
  totalPullRequests: number,
  totalChangedFiles: number,
  totalAditions: number,
  totalDeletions: number,
  percentageFeatures?: number,
  percentageBugfixes?: number,
  percentageHotfixes?: number
}
export interface PullRequestItem {
  number: number,
  type: "feature" | "bugfix" | "hotfix",
  description: string,
  date: Date,
  changedFiles: number,
  additions: number,
  deletions: number,
  author: string
}

export default function Home() {
  const [summary, setSummary] = useState<Summary>(undefined as unknown as Summary);
  const [pullRequestList, setPullRequestList] = useState<PullRequestItem[]>([] as PullRequestItem[]);
  const [printMode, setPrintMode] = useState<boolean>(false);

  const onFilePick = (event: any) => {
    const file = event.target.files[0]
    const reader = new FileReader()
    reader.onload = (f: ProgressEvent) => {

      try {
        // @ts-ignore
        const jsonData = JSON.parse(f.target.result as string);

        const parsedPullRequestList: PullRequestItem[] = jsonData.map((item: any) => {
          let typeAux = item.title.split(":")[0].toLowerCase();
          let descriptionAux = (item.title + item.body).split(":")[1];

          if ( descriptionAux ) {
            descriptionAux = descriptionAux.charAt(1).toUpperCase() + descriptionAux.slice(2);
            descriptionAux = descriptionAux.replaceAll("…", "");
          } else {
             descriptionAux = (item.title + item.body);
          }

          if ( typeAux.includes("/") ) {
            descriptionAux = (typeAux.split("/")[1].charAt(0).toUpperCase() + typeAux.split("/")[1].slice(1) + '\n' + item.body);
          }

          typeAux = typeAux.split("/")[0].toLowerCase();

          if ( typeAux.includes("feature") || typeAux.includes("feat") ) {
            item.type = "feature";
          } else if ( typeAux.includes("bugfix") || typeAux.includes("fix") ) {
            item.type = "bugfix";
          } else if ( typeAux.includes("hotfix") ) {
            item.type = "hotfix";
          }

          return {
            number: item.number,
            type: item.type,
            description: descriptionAux,
            date: new Date(item.createdAt),
            changedFiles: item.changedFiles,
            additions: item.additions,
            deletions: item.deletions,
            author: item.author.name
          }
        });

        const parsedSummary: Summary = {
          authors: Array.from(new Set(parsedPullRequestList.map((item:PullRequestItem) => item.author))),
          totalPullRequests: parsedPullRequestList.length,
          totalChangedFiles: parsedPullRequestList.reduce((sum: number, item:PullRequestItem) => sum + item.changedFiles, 0),
          totalAditions: parsedPullRequestList.reduce((sum: number, item:PullRequestItem) => sum + item.additions, 0),
          totalDeletions: parsedPullRequestList.reduce((sum: number, item:PullRequestItem) => sum + item.deletions, 0),
          percentageFeatures: Math.round((parsedPullRequestList.filter((item:PullRequestItem) => item.type === "feature").length / parsedPullRequestList.length) * 100),
          percentageBugfixes: Math.round((parsedPullRequestList.filter((item:PullRequestItem) => item.type === "bugfix").length / parsedPullRequestList.length) * 100),
          percentageHotfixes: Math.round((parsedPullRequestList.filter((item:PullRequestItem) => item.type === "hotfix").length / parsedPullRequestList.length) * 100)
        }

        setSummary(parsedSummary);
        setPullRequestList(parsedPullRequestList);
      } catch (e) {
        console.log('Error parsing JSON file', e)
      }
    }

    if ( file instanceof Blob ) {
      reader.readAsText(file)
    }
  };

  const print = () => {
    setPrintMode(true);

    setTimeout(() => {
      window.print();
    }, 1000);

    setTimeout(() => {
      setPrintMode(false);
    }, 2000);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between gap-20 py-10 bg-[white] dark:bg-[black]">
      { !printMode &&
        <div className="flex flex-col gap-2 w-fit py-2 px-2 rounded-[20px] bg-slate-100 dark:bg-slate-900">
          <div className="mockup-code mx-auto w-fit max-w-full">
            <pre data-prefix="$"><code>gh pr list \</code></pre>
            <pre data-prefix=""><code>-L 1000 \</code></pre>
            <pre data-prefix=""><code>--search {'"'}is:closed created:2023-11-01..2023-11-30 author:AUTHOR_USERNAME{'"'} \</code></pre>
            <pre data-prefix=""><code>--json number,title,body,author,createdAt,additions,deletions,changedFiles \</code></pre>
            <pre data-prefix=""><code>{'>'} FILE_LOCATION.json</code></pre>
          </div>

          <div className="flex items-center justify-center">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-fit h-fit py-5 px-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
              <div className="flex flex-col items-center justify-center pt-1 pb-1">
                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">.json or any file with JSON data</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" onChange={onFilePick} />
            </label>
          </div> 

          { summary &&
            <button onClick={print} className="btn w-fit mx-auto">
              <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
              <span>Export</span>
            </button>
          }
        </div>
      }

      <div id="pdf" className="print flex flex-col items-center w-[210mm] max-w-full px-9">
        { summary &&
          <>
            <div className="authors w-fit bg-slate-100 dark:bg-slate-900 px-7 py-5 rounded-lg flex flex-row gap-5 mb-2">
              <div className="item">
                <div className="title text-center text-[0.7rem] mb-2 text-slate-400 dark:text-slate-500">AUTHORS</div>
                {
                  summary.authors.map((item: string, index: number) => {
                    return(
                      <div key={index} className="value text-xl text-center">{item}</div>
                    );
                  })
                }
              </div>
            </div>
            <div className="summary w-fit bg-slate-100 dark:bg-slate-900 px-7 py-5 rounded-lg flex flex-col gap-5 mb-2">
              <div className="flex w-full justify-between gap-5">
                <div className="item">
                  <div className="title text-center text-[0.7rem] mb-2 text-slate-400 dark:text-slate-500">PULL REQUESTS</div>
                  <div className="value text-3xl text-center">{(summary.totalPullRequests)}</div>
                </div>
                <div className="item">
                  <div className="title text-center text-[0.7rem] mb-2 text-slate-400 dark:text-slate-500">CHANGED FILES</div>
                  <div className="value text-3xl text-center">{summary.totalChangedFiles}</div>
                </div>
                <div className="item">
                  <div className="title text-center text-[0.7rem] mb-2 text-slate-400 dark:text-slate-500">CHANGED LINES</div>
                  <div className="value text-3xl text-center">{summary.totalAditions}</div>
                </div>
              </div>
              <div className="flex w-full justify-between gap-5">
                <div className="item">
                  <div className="title text-center text-[0.7rem] mb-2 text-slate-400 dark:text-slate-500">FEATURES</div>
                  {/* @ts-ignore */}
                  <div className="radial-progress text-teal-500 dark:text-teal-400" style={{"--value": summary.percentageFeatures, "--size": "4rem" }} role="progressbar">{summary.percentageFeatures}%</div>
                </div>
                <div className="item">
                  <div className="title text-center text-[0.7rem] mb-2 text-slate-400 dark:text-slate-500">BUG FIXES</div>
                  {/* @ts-ignore */}
                  <div className="radial-progress text-orange-500 dark:text-orange-400" style={{"--value": summary.percentageBugfixes, "--size": "4rem" }} role="progressbar">{summary.percentageBugfixes}%</div>
                </div>
                <div className="item">
                  <div className="title text-center text-[0.7rem] mb-2 text-slate-400 dark:text-slate-500">HOT FIXES</div>
                  {/* @ts-ignore */}
                  <div className="radial-progress text-fuchsia-500 dark:text-fuchsia-400" style={{"--value": summary.percentageHotfixes, "--size": "4rem" }} role="progressbar">{summary.percentageHotfixes}%</div>
                </div>
              </div>
            </div>
          </>
        }

        <div className="list flex flex-col gap-2">
          {
            pullRequestList.map((item: PullRequestItem, index: number) => {
             return(
                <div key={index} className="item bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-lg flex flex-col gap-0">
                  <div className="header flex flex-row justify-between">
                    <div className="flex items-center gap-3">
                      <div className="number text-slate-400 dark:text-slate-500">#{item.number}</div>
                      <div className={`
                        type 
                        ${item.type === 'feature' ? 'bg-teal-300 font-bold flex items-center text-[0.7rem] uppercase text-teal-900 dark:bg-teal-900 dark:text-teal-400 px-2 rounded-full' : ''} 
                        ${item.type === 'bugfix' ? 'bg-orange-300 font-bold flex items-center text-[0.7rem] uppercase text-orange-900 dark:bg-orange-900 dark:text-orange-400 px-2 rounded-full' : ''} 
                        ${item.type === 'hotfix' ? 'bg-fuchsia-300 font-bold flex items-center text-[0.7rem] uppercase text-fuchsia-900 dark:bg-fuchsia-900 dark:text-fuchsia-400 px-2 rounded-full' : ''} 
                      `}>
                        {item.type}
                      </div>
                      <div className="changedFiles font-bold flex items-center text-[0.7rem] bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-400 px-2 rounded-full"><span className="font-normal mr-2">CHANGED FILES:</span>{item.changedFiles}</div>
                      <div className="additions font-bold flex items-center text-[0.7rem] bg-emerald-300 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-400 px-2 rounded-full">+{item.additions}</div>
                      <div className="deletions font-bold flex items-center text-[0.7rem] bg-red-300 text-red-900 dark:bg-red-900 dark:text-red-400 px-2 rounded-full">-{item.deletions}</div>
                    </div>

                    <div className="date text-slate-400 dark:text-slate-500">{("0" + item.date.getDate()).slice(-2)}/{("0" + (item.date.getMonth() + 1)).slice(-2)}/{item.date.getFullYear()}</div>
                  </div>

                  <div className="description mt-3 whitespace-pre-wrap">{item.description}</div>

                  <div className="footer flex justify-between">
                    {
                      summary?.authors?.length > 1 
                        ? <div className="author text-slate-400 dark:text-slate-500" >{item.author}</div>
                        : <div className="author text-slate-400 dark:text-slate-500" ></div>
                    }
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    </main>
  )
}
