'use client';

import { useState } from "react";

export interface Summary {
  authors: string[],
  totalPullRequests: number,
  totalChangedFiles: number,
  totalAditions: number,
  totalDeletions: number
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
        }

        setSummary(parsedSummary);
        setPullRequestList(parsedPullRequestList);
      } catch (e) {
        console.log('Error parsing JSON file', e)
      }
    }
    reader.readAsText(file)
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="block mb-10">
        <input type="file" name="json" onChange={onFilePick} />
      </div>

      { summary &&
        <>
          <div className="summary bg-slate-100 dark:bg-slate-900 px-7 py-5 rounded-lg flex flex-row gap-5 mb-2">
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
          <div className="authors bg-slate-100 dark:bg-slate-900 px-7 py-5 rounded-lg flex flex-row gap-5 mb-2">
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
        </>
      }

      <div className="list flex flex-col gap-2">
        {
          pullRequestList.map((item: PullRequestItem, index: number) => {
            return(
              <div key={index} className="item bg-slate-100 dark:bg-slate-900 px-7 py-5 rounded-lg flex flex-col gap-5">
                <div className="header flex flex-row justify-between">
                  <div className="flex gap-3">
                    <div className="number text-slate-400 dark:text-slate-500">#{item.number}</div>
                    <div className={`
                      type 
                      ${item.type === 'feature' ? 'bg-teal-300 text-teal-900 dark:bg-teal-900 dark:text-teal-400 px-2 rounded-full' : ''} 
                      ${item.type === 'bugfix' ? 'bg-orange-300 text-orange-900 dark:bg-orange-900 dark:text-orange-400 px-2 rounded-full' : ''} 
                      ${item.type === 'hotfix' ? 'bg-fuchsia-300 text-fuchsia-900 dark:bg-fuchsia-900 dark:text-fuchsia-400 px-2 rounded-full' : ''} 
                    `}>
                      {item.type}
                    </div>
                  </div>

                  <div className="date text-slate-400 dark:text-slate-500">{("0" + item.date.getDate()).slice(-2)}/{("0" + (item.date.getMonth() + 1)).slice(-2)}/{item.date.getFullYear()}</div>
                </div>

                <div className="description text-lg whitespace-pre-wrap">{item.description}</div>

                <div className="footer flex justify-between">
                  {
                    summary?.authors?.length > 1 
                      ? <div className="author text-slate-400 dark:text-slate-500" >{item.author}</div>
                      : <div className="author text-slate-400 dark:text-slate-500" ></div>
                  }

                  <div className="flex gap-3">
                    <div className="changedFiles flex items-center bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-400 px-2 rounded-full"><span className="text-[0.7rem] mr-2">CHANGED FILES:</span>{item.changedFiles}</div>
                    <div className="additions bg-emerald-300 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-400 px-2 rounded-full">+{item.additions}</div>
                    <div className="deletions bg-red-300 text-red-900 dark:bg-red-900 dark:text-red-400 px-2 rounded-full">-{item.deletions}</div>
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>
    </main>
  )
}
