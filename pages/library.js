import Head from 'next/head'
import { useEffect, useState } from 'react'
import 'focus-visible'
import { Container } from '../components/Container'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon, HomeIcon } from '@heroicons/react/20/solid'
import { Fragment } from 'react'
import {
  ExclamationCircleIcon,
  MusicalNoteIcon,
} from '@heroicons/react/24/outline'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { Disclosure } from '@headlessui/react'
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline'
import va from '@vercel/analytics'
import Link from 'next/link'

const filterChords = (chords) => {
  const uniqueChords = new Set()
  return chords.filter((item) => {
    if (!uniqueChords.has(item.chord)) {
      uniqueChords.add(item.chord)
      return true
    }
    return false
  })
}

const randomPosition = (library, oldPosition) => {
  const newPosition = Math.floor(Math.random() * library.length)
  if (newPosition === oldPosition) {
    if (newPosition + 1 < library.length) {
      return newPosition + 1
    }
    if (newPosition - 1 >= 0) {
      return newPosition - 1
    }
  } else {
    return newPosition
  }
}

export default function Library() {
  const [library, setLibrary] = useState([])
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState(0)
  const [current, setCurrent] = useState(null)
  const [showError, setShowError] = useState(false)
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  useEffect(() => {
    if (showError) {
      setTimeout(() => {
        setShowError(false)
      }, 5000)
    }
  }, [showError])

  useEffect(() => {
    fetchLibrary()
      .then(() => console.log('Progressions fetched'))
      .catch((error) => {
        console.error(error)
      })
  }, [])

  useEffect(() => {
    fetchProgression()
      .then(() => console.log('Progression fetched'))
      .catch((error) => {
        console.error(error)
      })
  }, [position, library])

  async function fetchLibrary() {
    try {
      setLoading(true)
      const response = await fetch('/api/library', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        )
      }

      setLibrary(data.result)

      setLoading(false)

      va.track('library-fetched')
    } catch (error) {
      console.error(error)
      setLoading(false)
      setShowError(true)
    }
  }

  async function fetchProgression() {
    try {
      setLoading(true)
      const response = await fetch(
        '/api/library/' + library[position].replace('#', '-sharp-'),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await response.json()
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        )
      }

      const result = data.result
      setCurrent(result)
      setLoading(false)
      va.track('library-progression', { progression: library[position] })
    } catch (error) {
      console.error(error)
      setLoading(false)
      setShowError(true)
    }
  }

  async function generateExplanation(event) {
    event.preventDefault()
    if (!current.progression) return
    try {
      setLoadingExplanation(true)
      await fetch('/api/explanation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progression: current.progression.progression,
          style: current.progression.style,
          key: current.progression.key,
          history: [],
        }),
      })

      await fetchProgression()

      setLoadingExplanation(false)

      va.track('explanation', {
        progression: current.progression.progression.toString(),
        style: current.progression.style,
        key: current.progression.key,
      })
    } catch (error) {
      console.error(error)
      setLoadingExplanation(false)
      setShowError(true)
    }
  }

  const uniqueChords =
    current &&
    current.progression &&
    current.progression.fingering &&
    current.progression.fingering.length > 0
      ? filterChords(current.progression.fingering)
      : []

  const ErrorNotification = (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={showError || false}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ExclamationCircleIcon
                      className="h-6 w-6 text-red-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-800">
                      No response received
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      This can be due to high traffic. Please try again.
                    </p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => {
                        setShowError(false)
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  )

  const Hero = () => (
    <div className="border-b pb-4">
      <img
        className="mx-auto mb-6 h-24 w-24 justify-center border-black sm:h-32 sm:w-32"
        src="/chord.png"
        alt="ChordCraft Logo"
      />
      <h1 className="text-4xl font-bold tracking-tight text-gray-800 sm:text-6xl">
        Library
      </h1>

      <p className="mt-6 text-lg leading-8 text-gray-600">
        Explore our archive of user generated progressions.
      </p>
    </div>
  )

  const renderLoadingIndicator = () => (
    <div className="mt-4 text-center">
      <div role="status">
        <svg
          aria-hidden="true"
          className="my-6 mr-2 inline h-8 w-8 animate-spin fill-pink-500 text-gray-200 dark:text-gray-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )

  const GenerationSection = () => {
    if (!current) return <></>
    const hasGeneration = current.progression
    const hasExplanation = current.explanation

    const renderExplanationButton = () =>
      current.progression &&
      !current.explanation && (
        <button
          disabled={
            loading || !hasGeneration || hasExplanation || loadingExplanation
          }
          onClick={generateExplanation}
          className="mt-6 rounded-md bg-pink-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 disabled:bg-gray-600"
        >
          Explanation&nbsp;<span aria-hidden="true">→</span>
        </button>
      )

    const renderChordTabs = () => (
      <div className="mt-4">
        <div className="rounded-lg  px-4 py-5  sm:p-6">
          <h3 className="pb-1 text-base font-semibold leading-6 text-gray-800 ">
            Chord Tabs
          </h3>
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {current.progression &&
              uniqueChords.map((c, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
                >
                  <dt className="truncate text-sm font-semibold text-gray-500">
                    {c.chord}
                  </dt>
                  <dd className="mt-1 text-xl font-semibold uppercase tracking-wider text-gray-800">
                    {c.tab.toString()}
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      </div>
    )

    const renderExplanation = () => (
      <>
        <div className="mt-4 rounded-lg bg-white shadow">
          <div className="mx-auto max-w-7xl px-6 py-8 sm:py-8 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-4xl divide-y divide-black/10">
              <dl className="space-y-6 divide-y divide-black/10">
                {current.explanation.map((x, index) => (
                  <Disclosure
                    as="div"
                    key={x.topic}
                    className={index === 0 ? '' : 'pt-6'}
                  >
                    {({ open }) => (
                      <>
                        <dt>
                          <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-800">
                            <span className="text-base font-semibold leading-7">
                              {x.topic}
                            </span>
                            <span className="ml-6 flex h-7 items-center">
                              {open ? (
                                <MinusSmallIcon
                                  className="h-6 w-6"
                                  aria-hidden="true"
                                />
                              ) : (
                                <PlusSmallIcon
                                  className="h-6 w-6"
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                          </Disclosure.Button>
                        </dt>
                        <Disclosure.Panel
                          as="dd"
                          className="mt-2 pr-12 text-left"
                        >
                          <p className="text-left text-base leading-7 text-gray-600">
                            {x.explanation}
                          </p>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </>
    )

    return (
      <div className="">
        <div className="mt-4 py-4">
          {hasGeneration && (
            <div>
              <div className="rounded-lg bg-white px-4 py-5   shadow shadow-pink-200 sm:p-6">
                <h3 className="rounded-lg bg-white px-4 pb-4 text-4xl font-bold tracking-tight">
                  {current.progression.progression.map((chord, index) => (
                    <Fragment key={index}>
                      <span className={'px-0.5 text-pink-500'}>{chord} </span>
                      {current.progression.progression.length >= 6 &&
                        current.progression.progression.length < 12 &&
                        index === 3 && <br />}
                      {current.progression.progression.length >= 12 &&
                        current.progression.progression.length < 16 &&
                        index === 7 && <br />}
                      {current.progression.progression.length >= 16 &&
                        index === 11 && <br />}
                    </Fragment>
                  ))}
                </h3>
                {current.progression &&
                  current.progression.strumming_pattern && (
                    <p className="text-md  leading-8 text-pink-600">
                      Strumming Pattern:{' '}
                      {current.progression &&
                        current.progression.strumming_pattern}
                    </p>
                  )}
                <p className="text-md  leading-8 text-gray-700">
                  {current.progression && current.progression.context}
                </p>
              </div>
            </div>
          )}

          {hasGeneration && (
            <div>
              <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Key
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight text-gray-800">
                    {current.progression && current.progression.key}
                  </dd>
                </div>

                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Tempo
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight text-gray-800">
                    {current.progression && current.progression.tempo}
                  </dd>
                </div>

                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Style
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight text-gray-800">
                    {current.progression && current.progression.style}
                  </dd>
                </div>
              </dl>

              {current.progression &&
                uniqueChords &&
                uniqueChords.length > 0 &&
                renderChordTabs()}

              {loadingExplanation
                ? renderLoadingIndicator()
                : renderExplanationButton()}

              {!loadingExplanation && hasExplanation && renderExplanation()}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <link rel="icon" href="/chord.png" />
      </Head>
      <div className="pb-12 sm:pb-4 ">
        <Container>
          <div className="relative isolate px-6  lg:px-8">
            <div
              className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
              aria-hidden="true"
            >
              <div
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
              />
            </div>
            <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
              <div className="text-center">
                {Hero()}
                {loading && renderLoadingIndicator()}
                {!loading && (
                  <>
                    <div className="flex justify-center">
                      <button
                        disabled={loading}
                        onClick={() => {
                          setPosition(randomPosition(library, position))
                        }}
                        className="justify-right text-md mt-6 flex rounded-md border border-pink-500 px-3.5 py-2.5 font-semibold text-pink-500 shadow-sm hover:bg-pink-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 disabled:border-gray-600 disabled:text-gray-300"
                      >
                        Next Progression&nbsp;
                        <MusicalNoteIcon
                          className="ml-1 inline-flex h-5 w-5 translate-y-0.5"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                    <div className="mt-2 text-sm tracking-wide text-gray-500">
                      {library.length} Total
                    </div>
                  </>
                )}
                {GenerationSection()}
              </div>
              {!loading && !loadingExplanation && (
                <h2 className="text-md mt-4 text-center font-semibold text-slate-700">
                  <Link
                    href={`/`}
                    className=" rounded-md  border-b p-2 hover:bg-gray-600 hover:text-white"
                  >
                    Go Back
                    <HomeIcon
                      className="ml-1 inline-flex h-5 w-5 -translate-y-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </h2>
              )}
            </div>
            <div
              className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
              aria-hidden="true"
            >
              <div
                className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
              />
            </div>
          </div>
        </Container>
      </div>
      {ErrorNotification}
    </>
  )
}
