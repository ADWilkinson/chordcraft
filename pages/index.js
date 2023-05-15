import Head from 'next/head'
import { useState } from 'react'
import 'focus-visible'
import { Container } from '../components/Container'
import { Menu, Transition } from '@headlessui/react'
import {
  ChevronDownIcon,
} from '@heroicons/react/20/solid'
import { Fragment } from 'react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Home() {
  const [prompt, setPrompt] = useState({
    instrument: '',
    style: '',
    mood: '',
  })
  const [generation, setGeneration] = useState()
  const [loading, setLoading] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    try {
      setLoading(true)
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: prompt }),
      })

      const data = await response.json()
      setLoading(false)
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        )
      }

      setGeneration(JSON.parse(data.result))
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error)
      alert(error.message)
    }
  }

  return (
    <>
      <Head>
        <title>Chord Progression AI</title>
        <meta
          name="description"
          content="Generate chord progressions with AI."
        />
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
                <img
                  className="mx-auto mb-6 h-32 w-32 justify-center"
                  src="/chord.png"
                />
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Chord Progression AI
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Select a instrument, style and mood to generate something new
                  to play.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  {/* style */}
                  <Menu as="div" className="relative inline-block text-left">
                    <div>
                      <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        {prompt.instrument || 'Instrument'}
                        <ChevronDownIcon
                          className="-mr-1 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Menu.Button>
                    </div>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={() =>
                                  setPrompt({ ...prompt, instrument: 'Guitar' })
                                }
                                className={classNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block px-4 py-2 text-sm'
                                )}
                              >
                                Guitar
                              </div>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={() =>
                                  setPrompt({ ...prompt, instrument: 'Piano' })
                                }
                                className={classNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block px-4 py-2 text-sm'
                                )}
                              >
                                Piano
                              </div>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <>
                                <input
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      setPrompt({
                                        ...prompt,
                                        instrument: e.target.value,
                                      })
                                    }
                                  }}
                                  onChange={(e) => {
                                    e.preventDefault()

                                    setPrompt({
                                      ...prompt,
                                      instrument: e.target.value,
                                    })
                                  }}
                                  className={classNames(
                                    active
                                      ? 'bg-gray-100 text-gray-900'
                                      : 'text-gray-700',
                                    'group flex items-center px-4 py-2 text-sm'
                                  )}
                                  placeholder="Add another"
                                />
                              </>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>

                  {/* style */}
                  <Menu
                    onKeyDown={(e) => {
                      if (e.key === 'Spacebar') {
                        setPrompt({ ...prompt, style: '123' })
                      }
                    }}
                    as="div"
                    className="relative inline-block text-left"
                  >
                    <div>
                      <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        {prompt.style || 'Style'}
                        <ChevronDownIcon
                          className="-mr-1 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Menu.Button>
                    </div>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={() =>
                                  setPrompt({ ...prompt, style: 'Jazz' })
                                }
                                className={classNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block px-4 py-2 text-sm'
                                )}
                              >
                                Jazz
                              </div>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={() =>
                                  setPrompt({ ...prompt, style: 'Blues' })
                                }
                                className={classNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block px-4 py-2 text-sm'
                                )}
                              >
                                Blues
                              </div>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={() =>
                                  setPrompt({ ...prompt, style: 'Rock' })
                                }
                                className={classNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block px-4 py-2 text-sm'
                                )}
                              >
                                Rock
                              </div>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={() =>
                                  setPrompt({ ...prompt, style: 'Classical' })
                                }
                                className={classNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block px-4 py-2 text-sm'
                                )}
                              >
                                Classical
                              </div>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={() =>
                                  setPrompt({ ...prompt, style: 'Gospel' })
                                }
                                className={classNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block px-4 py-2 text-sm'
                                )}
                              >
                                Gospel
                              </div>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={() =>
                                  setPrompt({ ...prompt, style: 'Country' })
                                }
                                className={classNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block px-4 py-2 text-sm'
                                )}
                              >
                                Country
                              </div>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={() =>
                                  setPrompt({ ...prompt, style: 'Pop' })
                                }
                                className={classNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block px-4 py-2 text-sm'
                                )}
                              >
                                Pop
                              </div>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <>
                                <input
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      setPrompt({
                                        ...prompt,
                                        style: e.target.value,
                                      })
                                    }
                                  }}
                                  onChange={(e) => {
                                    e.preventDefault()

                                    setPrompt({
                                      ...prompt,
                                      style: e.target.value,
                                    })
                                  }}
                                  className={classNames(
                                    active
                                      ? 'bg-gray-100 text-gray-900'
                                      : 'text-gray-700',
                                    'group flex items-center px-4 py-2 text-sm'
                                  )}
                                  placeholder="Add another"
                                />
                              </>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>

                  {/* mood */}
                  <Menu as="div" className="relative inline-block text-left">
                    <div>
                      <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        {prompt.mood || 'Mood'}
                        <ChevronDownIcon
                          className="-mr-1 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Menu.Button>
                    </div>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={() =>
                                  setPrompt({ ...prompt, mood: 'Happy' })
                                }
                                className={classNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block px-4 py-2 text-sm'
                                )}
                              >
                                Happy
                              </div>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={() =>
                                  setPrompt({ ...prompt, mood: 'Sad' })
                                }
                                className={classNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block px-4 py-2 text-sm'
                                )}
                              >
                                Sad
                              </div>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={() =>
                                  setPrompt({ ...prompt, mood: 'Energetic' })
                                }
                                className={classNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block px-4 py-2 text-sm'
                                )}
                              >
                                Energetic
                              </div>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={() =>
                                  setPrompt({ ...prompt, mood: 'Relaxing' })
                                }
                                className={classNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block px-4 py-2 text-sm'
                                )}
                              >
                                Relaxing
                              </div>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={() =>
                                  setPrompt({ ...prompt, mood: 'Epic' })
                                }
                                className={classNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block px-4 py-2 text-sm'
                                )}
                              >
                                Epic
                              </div>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={() =>
                                  setPrompt({ ...prompt, mood: 'Melancholic' })
                                }
                                className={classNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block px-4 py-2 text-sm'
                                )}
                              >
                                Melancholic
                              </div>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <>
                                <input
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      setPrompt({
                                        ...prompt,
                                        mood: e.target.value,
                                      })
                                    }
                                  }}
                                  onChange={(e) => {
                                    e.preventDefault()

                                    setPrompt({
                                      ...prompt,
                                      mood: e.target.value,
                                    })
                                  }}
                                  className={classNames(
                                    active
                                      ? 'bg-gray-100 text-gray-900'
                                      : 'text-gray-700',
                                    'group flex items-center px-4 py-2 text-sm'
                                  )}
                                  placeholder="Add another"
                                />
                              </>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>

                <div className="pt-8">
                  {loading ? (
                    <div class="text-center">
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          class="my-8 mr-2 inline h-8 w-8 animate-spin fill-indigo-600 text-gray-200 dark:text-gray-600"
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
                        <span class="sr-only">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      disabled={
                        loading ||
                        prompt.instrument === '' ||
                        prompt.mood === '' ||
                        prompt.style === ''
                      }
                      onClick={onSubmit}
                      className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-600"
                    >
                      Generate <span aria-hidden="true">→</span>
                    </button>
                  )}

                  <div className="mt-8 border-t py-4">
                    {generation && (
                      <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                        <h3 className="pb-2 text-base font-semibold leading-6 text-gray-900 ">
                          Progression
                        </h3>

                        <h3 className=" rounded-lg bg-white px-4 py-5 text-4xl font-bold tracking-tight">
                          {generation &&
                            generation.result.map((chord) => (
                              <span className={''}>{chord} </span>
                            ))}
                        </h3>
                        <p className="text-md  leading-8 text-gray-600">
                          {generation && generation.context}
                        </p>
                      </div>
                    )}
                    {generation && (
                      <div>
                        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                            <dt className="truncate text-sm font-medium text-gray-500">
                              Key
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                              {generation && generation.key}
                            </dd>
                          </div>

                          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                            <dt className="truncate text-sm font-medium text-gray-500">
                              Tempo
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                              {generation && generation.tempo}
                            </dd>
                          </div>

                          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                            <dt className="truncate text-sm font-medium text-gray-500">
                              Style
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                              {generation && generation.style}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
    </>
  )
}
