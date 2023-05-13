import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [cryptoQuery, setCryptoQuery] = useState("");
  const [result, setResult] = useState();

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cryptoQuery: cryptoQuery }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setCryptoQuery("");
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className={styles.main}>
        <img src="/dog.png" className={styles.icon} />
        <h3>Navigate Web3</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="cryptoQuery"
            placeholder="What are you looking for?"
            value={cryptoQuery}
            onChange={(e) => setCryptoQuery(e.target.value)}
          />
          <input type="submit" value="Navigate" />
        </form>
        <div className={styles.result}>{result}</div>
      </main>
    </div>
  );
}
