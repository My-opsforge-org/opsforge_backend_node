const express = require('express');
const router = express.Router();

// Get all avatars with representative figures
router.get('/', (req, res) => {
  const avatars = [
    {
      "name": "Elon Musk",
      "image_url": "https://imgs.search.brave.com/tJziodWUzRhVkjY3q-c6UpMZveParG8XCR1fkZeIuC0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTEz/MDU5ODMxOC9waG90/by90ZXNsYS1jZW8t/ZWxvbi1tdXNrLXNw/ZWFrcy1kdXJpbmct/dGhlLXVudmVpbGlu/Zy1vZi10aGUtbmV3/LXRlc2xhLW1vZGVs/LXktaW4taGF3dGhv/cm5lLmpwZz9zPTYx/Mng2MTImdz0wJms9/MjAmYz1iSFhFZm8z/cnZETjAxNkF4RlYt/WVNEY1ozazdMcU1R/RFM2aF9ocS1lU0V3/PQ",
      "quote": "If something's important enough, you should try. Even if - the probable outcome is failure.",
      "description": "Entrepreneur, visionary behind SpaceX, Tesla, Neuralink."
    },
    {
      "name": "Joe Rogan",
      "image_url": "https://media-cldnry.s-nbcnews.com/image/upload/t_fit-1500w,f_auto,q_auto:best/rockcms/2024-02/240202-joe-rogan-beg-1229p-0cd004.jpg",
      "quote": "I don't care if you're gay, black, Chinese, straight. That means nothing to me. It's all an illusion.",
      "description": "Podcast host, comedian, UFC commentator."
    },
    {
      "name": "Jordan Peterson",
      "image_url": "https://yt3.googleusercontent.com/EjQNRQGTldnH7kUHaRRWa_yOa6Po-GODJN0xqJEmsji96cAVBdLggAgHlw2DbKSvomyo3xm2CX0=s900-c-k-c0x00ffffff-no-rj",
      "quote": "It's in responsibility that most people find the meaning that sustains them through life.",
      "description": "Psychologist and author focused on personal meaning and responsibility."
    },
    {
      "name": "Marcus Aurelius",
      "image_url": "https://imgs.search.brave.com/FNPnPODR7_KqT64j2vW6yqXm6RRbdtR2sOx5LZr59f0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNDkz/OTU3NzUzL3Bob3Rv/L2VtcGVyb3ItbWFy/Y3VzLWF1cmVsaXVz/LW9uLWhvcnNlLmpw/Zz9zPTYxMng2MTIm/dz0wJms9MjAmYz1K/d3NlRy1QWURvSF9Y/aXYzekIxamUyWV9J/cHdDcVNaQVhuQi16/eUpSTmNzPQ",
      "quote": "You have power over your mind -- not outside events. Realize this, and you will find strength.",
      "description": "Roman Stoic philosopher and author of *Meditations*."
    },
    {
      "name": "Arnold Schwarzenegger",
      "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8330nkAQx4jBsQVXfnXI-EwYx6INptKPAWQ&s",
      "quote": "Strength does not come from winning. Your struggles develop your strengths. When you go through hardships and decide not to surrender, that is strength",
      "description": "Roman Stoic philosopher and essayist."
    },
    {
      "name": "Albert Einstein",
      "image_url": "https://imgs.search.brave.com/UCbjKZ0o1VLF36Un7OjTQ4EwvuNdGWQWhFn8ne0Y4l8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuaW1tZWRpYXRl/LmNvLnVrL3Byb2R1/Y3Rpb24vdm9sYXRp/bGUvc2l0ZXMvNy8y/MDE5LzAzL0dldHR5/SW1hZ2VzLTUzMDcz/MDMxOC1jZjE2ZmNk/LnBuZz9xdWFsaXR5/PTkwJmZpdD02MjEs/NDE0",
      "quote": "There are only two ways to live your life. One is as though nothing is a miracle. The other is as though everything is a miracle.",
      "description": "Theoretical physicist and Nobel Prize winner."
    },
    {
      "name": "Genghis Khan",
      "image_url": "https://cdn.sanity.io/images/cxgd3urn/production/f44ea605a2d7e5732034a7fa35b2ac4fde066cfa-1772x2909.jpg?w=1200&h=1970&q=85&fit=crop&auto=format",
      "quote": "The greatest happiness is to scatter your enemy, to drive him before you, to see his cities reduced to ashes, to see those who love him shrouded in tears, and to gather into your bosom his wives and daughters.",
      "description": "Anti-apartheid leader and former President of South Africa."
    },
    {
      "name": "Socrates",
      "image_url": "https://imgs.search.brave.com/5DOq1BVXaPk5-UQb4hBIREJb4WwfADr-pHXWJCI1jkA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA0LzQ3LzA1LzE4/LzM2MF9GXzQ0NzA1/MTgzNl9tdEJrNUFG/Q3VSZGpRWXhDQkxE/bUpjdUZQSFBHQXZv/by5qcGc",
      "quote": "The unexamined life is not worth living.",
      "description": "Classical Greek philosopher credited as a founder of Western ethics."
    },
    {
      "name": "Plato",
      "image_url": "https://imgs.search.brave.com/Pbu-CZADAp5sdqsuMK819M5cOxAcTBxP_ghu0xMGK50/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9wbGF0/by1waGlsb3NvcGhl/ci1zdGF0dWUtYXRo/ZW5zLWdyZWVjZS0z/NDk0NzE1OC5qcGc",
      "quote": "Wise men speak because they have something to say; fools because they have to say something.",
      "description": "Student of Socrates and founder of the Academy in Athens."
    },
    {
      "name": "Aristotle",
      "image_url": "https://imgs.search.brave.com/a3zritDnYWHMhlYoaBmpvGFuq1MdrkaBGWBZHPi7H9c/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jbGFz/c2ljYWxsaWJlcmFs/YXJ0cy5jb20vd3At/Y29udGVudC91cGxv/YWRzL2FyaXN0b3Rs/ZS1idy0yLTI5OHgz/MDAucG5n",
      "quote": "Knowing yourself is the beginning of all wisdom.",
      "description": "Greek philosopher and polymath, tutor to Alexander the Great."
    },
    {
      "name": "Leonardo da Vinci",
      "image_url": "https://imgs.search.brave.com/PdEmhK4FWZAskOHlzuyXeGMM0FSBiZQ_pk6jQOzuUuE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvNTE3/ODUxOTExL3ZlY3Rv/ci9sZW9uYXJkby1k/YS12aW5jaS1lbmdy/YXZpbmcuanBnP3M9/NjEyeDYxMiZ3PTAm/az0yMCZjPTNqUVR4/MlFFbUxLSVVwX1Iw/MmJjWXRWY3oxUWVt/RzdwOUUzYVNWRzVS/b2s9",
      "quote": "Learning never exhausts the mind.",
      "description": "Renaissance polymath: painter, inventor, thinker."
    },
    {
      "name": "Alan Turing",
      "image_url": "https://upload.wikimedia.org/wikipedia/commons/f/f8/Alan_Turing_%281951%29.jpg",
      "quote": "We can only see a short distance ahead, but we can see plenty there that needs to be done.",
      "description": "Pioneer of computer science and artificial intelligence."
    },
    {
      "name": "Steve Jobs",
      "image_url": "https://imgs.search.brave.com/D7TiuFTrHOSQ41a3xwZ7mXL-V7zG9wmPBhsd6MDdbgk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hbGxh/Ym91dHN0ZXZlam9i/cy5jb20vcmVzb3Vy/Y2VzL2ltZy90aHVt/YnMvcGljc19oaWdo/bGlnaHRzLzIwMDUt/MDEtMTFfMDUxNzgu/anBn",
      "quote": "Innovation distinguishes between a leader and a follower.",
      "description": "Co-founder of Apple and visionary in personal computing."
    },
    {
      "name": "Jeff Bezos",
      "image_url": "https://hips.hearstapps.com/hmg-prod/images/jeff-bezos-at-the-11th-breakthrough-prize-ceremony-held-at-news-photo-1751043609.pjpeg",
      "quote": "Your brand is what other people say about you when you're not in the room.",
      "description": "Founder and former CEO of Amazon."
    },
    {
      "name": "Satya Nadella",
      "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg/960px-MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg",
      "quote": "Our industry does not respect tradition. It only respects innovation.",
      "description": "Microsoft CEO driving AI and cloud transformation."
    },
    {
      "name": "Sundar Pichai",
      "image_url": "https://imageio.forbes.com/specials-images/imageserve/67e5cbc9823431a56b4ad600/0x0.jpg?format=jpg&crop=1072,1072,x1828,y0,safe&height=416&width=416&fit=bounds",
      "quote": "Wear your failure as a badge of honor!",
      "description": "Google and Alphabet CEO leading cutting-edge AI initiatives."
    },
    {
      "name": "Andrew Ng",
      "image_url": "https://upload.wikimedia.org/wikipedia/commons/2/20/Andrew_Ng_at_TechCrunch_Disrupt_SF_2017.jpg",
      "quote": "Artificial intelligence is the new electricity.",
      "description": "AI educator, co-founder of Coursera, pioneer in machine learning."
    },
    {
      "name": "Cristiano Ronaldo",
      "image_url": "https://hips.hearstapps.com/hmg-prod/images/cristiano-ronaldo-of-portugal-during-the-uefa-nations-news-photo-1748359673.pjpeg?crop=0.610xw:0.917xh;0.317xw,0.0829xh&resize=640:*",
      "quote": "Your love makes me strong, your hate makes me unstoppable.",
      "description": "Football legend known for extraordinary work ethic."
    },
    {
      "name": "Lex Fridman",
      "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/50/Lex_Fridman_teaching_at_MIT_in_2018.png",
      "quote": "Conversations are about exploring truth, not performing.",
      "description": "AI researcher and thoughtful podcast host."
    },
    {
      "name": "Naval Ravikant",
      "image_url": "https://images.squarespace-cdn.com/content/v1/58de89eb17bffc754e3c1d33/1552963210906-LVA904K3O50RP633WOVG/Aug+2016+Headshot.jpg",
      "quote": "Earn with your mind, not your time.",
      "description": "Angel investor, philosopher-entrepreneur and thinker."
    }
  ];

  res.json({
    success: true,
    message: 'Avatars retrieved successfully',
    data: avatars,
    count: avatars.length
  });
});

module.exports = router; 