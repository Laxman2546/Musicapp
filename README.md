<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Native Music App README</title>
    <!-- Load Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Apply Inter font */
        body {
            font-family: "Inter", sans-serif;
        }
        /* Custom styles for GitHub-like table */
        table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid #d0d7de;
            border-radius: 6px;
            overflow: hidden;
        }
        th, td {
            border: 1px solid #d0d7de;
            padding: 0.75rem 1rem;
            text-align: left;
        }
        th {
            background-color: #f6f8fa;
            font-weight: 600;
        }
        tr:nth-child(even) {
            background-color: #f6f8fa;
        }
        /* Custom styles for code block */
        pre {
            background-color: #161b22;
            color: #e6edf3;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
            font-family: "Courier New", Courier, monospace;
        }
        code .comment {
            color: #8b949e;
        }
        code .command {
            color: #c9d1d9;
        }
        /* Custom style for blockquote */
        blockquote {
            border-left: 4px solid #d0d7de;
            padding-left: 1rem;
            color: #57606a;
            margin-left: 0;
            margin-right: 0;
        }
    </style>
    <!-- Load Inter font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen py-8 md:py-12">

    <!-- Main Content Container -->
    <main class="max-w-4xl mx-auto bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-10">
        
        <!-- Header -->
        <h1 class="text-3xl md:text-4xl font-bold border-b border-gray-200 pb-4 mb-6">
            🎵 React Native Music App
        </h1>
        
        <p class="text-lg text-gray-700 mb-6">
            A modern, elegant, and lightweight Music Streaming Application built using React Native.
        </p>
        
        <p class="text-base text-gray-700 mb-8">
            The app fetches real-time music data such as songs, playlists, albums, and artists using the JioSaavn Unofficial API, delivering a smooth and intuitive listening experience.
        </p>

        <!-- Features Section -->
        <h2 class="text-2xl md:text-3xl font-semibold border-b border-gray-200 pb-3 mb-5">
            ✨ Features
        </h2>
        <ul class="list-none space-y-3 mb-8">
            <li class="flex items-center text-gray-800">
                <span class="mr-3 text-xl">🎧</span> Music streaming with seamless playback
            </li>
            <li class="flex items-center text-gray-800">
                <span class="mr-3 text-xl">⏯</span> Play / Pause / Next / Previous controls
            </li>
            <li class="flex items-center text-gray-800">
                <span class="mr-3 text-xl">📍</span> Interactive seekbar & live track progress
            </li>
            <li class="flex items-center text-gray-800">
                <span class="mr-3 text-xl">🔍</span> Search for Songs, Albums, Artists & Playlists
            </li>
            <li class="flex items-center text-gray-800">
                <span class="mr-3 text-xl">🖼</span> Display album and playlist artwork
            </li>
            <li class="flex items-center text-gray-800">
                <span class="mr-3 text-xl">🔁</span> Shuffle & Loop modes
            </li>
            <li class="flex items-center text-gray-800">
                <span class="mr-3 text-xl">🔊</span> Volume control & playback speed (optional)
            </li>
            <li class="flex items-center text-gray-800">
                <span class="mr-3 text-xl">❤️</span> Local Favourites with AsyncStorage
            </li>
            <li class="flex items-center text-gray-800">
                <span class="mr-3 text-xl">📱</span> Fully responsive UI optimized for Android
            </li>
            <li class="flex items-center text-gray-800">
                <span class="mr-3 text-xl">⚙</span> Built with scalable React Native architecture
            </li>
        </ul>

        <!-- Tech Stack Section -->
        <h2 class="text-2xl md:text-3xl font-semibold border-b border-gray-200 pb-3 mb-5">
            🛠 Tech Stack
        </h2>
        <table>
            <thead>
                <tr>
                    <th>Technology</th>
                    <th>Purpose</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>React Native</strong></td>
                    <td>Core app framework</td>
                </tr>
                <tr>
                    <td><strong>TypeScript / JavaScript</strong></td>
                    <td>Strong typing & development</td>
                </tr>
                <tr>
                    <td><strong>react-native-track-player</strong></td>
                    <td>Audio streaming & background playback</td>
                </tr>
                <tr>
                    <td><strong>React Navigation</strong></td>
                    <td>Navigation & routing</td>
                </tr>
                <tr>
                    <td><strong>Axios / Fetch API</strong></td>
                    <td>API handling</td>
                </tr>
                <tr>
                    <td><strong>Tailwind / NativeWind / StyleSheet</strong></td>
                    <td>UI styling</td>
                </tr>
                <tr>
                    <td><strong>AsyncStorage</strong></td>
                    <td>Local storage for favourites</td>
                </tr>
            </tbody>
        </table>

        <!-- Installation Section -->
        <h2 class="text-2xl md:text-3xl font-semibold border-b border-gray-200 pb-3 mb-5">
            📦 Installation & Setup
        </h2>
        <pre><code><span class="comment"># 1. Clone the repository</span>
<span class="command">git clone https://github.com/Laxman2546/Musicapp</span>

<span class="comment"># 2. Navigate to the project directory</span>
<span class="command">cd Musicapp</span>

<span class="comment"># 3. Install dependencies</span>
<span class="command">npm install</span>

<span class="comment"># 4. Install iOS pods (if you are working on iOS)</span>
<span class="command">npx pod-install ios</span>

<span class="comment"># 5. Run the app (Android)</span>
<span class="command">npx react-native run-android</span>

<span class="comment"># 6. Run the app (iOS)</span>
<span class="comment"># npx react-native run-ios</span>
</code></pre>

        <!-- What I Learned Section -->
        <h2 class="text-2xl md:text-3xl font-semibold border-b border-gray-200 pb-3 mb-5 mt-8">
            🎯 What I Learned
        </h2>
        <ul class="list-disc list-inside space-y-2 mb-8 text-gray-800">
            <li>Working with external streaming APIs in React Native</li>
            <li>Building a custom audio player with advanced controls</li>
            <li>Managing global playback state using Context</li>
            <li>Handling API data efficiently with Axios</li>
            <li>Designing optimized UI/UX for mobile applications</li>
        </ul>

        <!-- Disclaimer Section -->
        <h2 class="text-2xl md:text-3xl font-semibold border-b border-gray-200 pb-3 mb-5">
            ⚠️ Disclaimer
        </h2>
        <blockquote class="mb-8 p-4 bg-gray-50 rounded-lg">
            <p class="italic">This project uses the JioSaavn Unofficial API solely for educational and personal learning purposes.</p>
            <p class="italic mt-2">All music, lyrics, album artwork, and trademarks belong to their respective copyright owners.</p>
            <p class="italic mt-2">This project is not affiliated with or endorsed by JioSaavn in any way.</p>
            <p class="italic mt-2">No copyrighted content is stored or used for commercial purposes.</p>
            <p class="italic mt-2">If you own any rights to content displayed and would like it removed, please contact me and updates will be made immediately.</p>
        </blockquote>

        <!-- Contact Section -->
        <h2 class="text-2xl md:text-3xl font-semibold border-b border-gray-200 pb-3 mb-5">
            📬 Contact
        </h2>
        <p class="text-lg text-gray-800 mb-2">
            👤 <strong>Ella Lakshman</strong>
        </p>
        <ul class="list-none space-y-2 mb-8">
            <li class="text-gray-800">
                📧 <strong>Email</strong>: <a href="mailto:laxmannani960@gmail.com" class="text-blue-600 hover:underline">laxmannani960@gmail.com</a>
            </li>
            <li class="text-gray-800">
                🔗 <strong>LinkedIn</strong>: <a href="https://www.linkedin.com/in/lakshman-25l46/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">https://www.linkedin.com/in/lakshman-25l46/</a>
            </li>
        </ul>

        <!-- Support Section -->
        <h2 class="text-2xl md:text-3xl font-semibold border-b border-gray-200 pb-3 mb-5">
            ⭐ Support
        </h2>
        <p class="text-base text-gray-700 mb-2">
            If you like this project, please consider giving it a star ⭐ on GitHub.
        </p>
        <p class="text-base text-gray-700">
            Your support motivates further development! 🚀
        p>

    </main>

</body>
</html>
