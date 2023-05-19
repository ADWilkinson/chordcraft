# ChordCraft

ChordCraft is an innovative tool that enables musicians and producers to generate unique chord progressions using artificial intelligence. By selecting a style and mood, users can create new chord progressions through an API that utilizes OpenAI's Chat GPT.

## Features

- Choose from a variety of styles and moods,.
- Generate unique chord progressions using AI.
- Powered by OpenAI's Chat GPT.
- Easy to use interface.

## Setup

### Prerequisites

- Node.js (version >= 14.6.0)
- [OpenAI API key](https://platform.openai.com/account/api-keys)

If you don’t have Node.js installed, [install it from here](https://nodejs.org/en/).

### Installation

1. Clone this repository:
   ```bash
   $ git clone https://github.com/<your-github-username>/chordcraft.git
   ```

2. Navigate into the project directory:
   ```bash
   $ cd chordcraft
   ```

3. Install the requirements:
   ```bash
   $ npm install
   ```

4. Make a copy of the example environment variables file:
   On Linux systems: 
   ```bash
   $ cp .env.example .env
   ```
   On Windows:
   ```powershell
   $ copy .env.example .env
   ```

5. Add your OpenAI API key to the newly created `.env` file.

6. Run the app:
   ```bash
   $ npm run dev
   ```

You should now be able to access the app at [http://localhost:3000](http://localhost:3000)!

## Usage

Select your preferred style and mood from the drop-down menus, and then click "Generate" to create a unique chord progression.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under