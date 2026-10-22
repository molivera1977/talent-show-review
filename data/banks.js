/* ═══════════════════════════════════════════════════════
   THE TALENT SHOW — REVIEW QUESTION BANKS (built 2026-10-22)
   Written new for this year's class (Marcos 10/21: never last year's test).
   The review and the test cover the same words and the same story parts
   with different sentences and stems.
     VOCAB_BANK  24 items, each word once: 12 definitions (V01–V24 ids) + 12 word usage (V25–V48 ids);
                 the words swap between the review and the test
     COMP_BANK   P01–P10 story details · P11–P20 Part A / Part B pairs
     CLOZE_BANK  C01–C24 (same word per id on both; new sentence)
   answer = index into choices (choices are shuffled at run time).
   page = the story page (34–37) the story panel opens to.
   The teacher dashboard reads this file (REVIEW_FILES) — keep ids stable.
═══════════════════════════════════════════════════════ */

/* Part II: the sentence, with the word underlined, then the question */
function tsInContext(sentence, word) {
  const underlined = sentence.replace(new RegExp('\\b' + word + '\\b', 'i'), m => `<u>${m}</u>`);
  return `${underlined}<br>What does <b>${word}</b> mean in this sentence?`;
}

window.VOCAB_BANK = [
  /* ── PART I: DEFINITIONS (12 words; the other 12 are asked this way on the test) ── */
  { id:"V02", q:"Which word means “one person alone, not a group”?", choices:["grip","individual","situation","inspiration"], answer:1 },
  { id:"V04", q:"Which word means “stopped for a moment before doing or saying something”?", choices:["describe","advise","take charge","hesitated"], answer:3 },
  { id:"V06", q:"Which word means “to be the one who leads and decides what to do”?", choices:["worry","take charge","consider","describe"], answer:1 },
  { id:"V08", q:"Which word means “what is happening at a certain time”?", choices:["routine","grip","self-esteem","situation"], answer:3 },
  { id:"V10", q:"Which word means “something that gives you an idea”?", choices:["individual","inspiration","situation","surprise"], answer:1 },
  { id:"V12", q:"Which word means “to think carefully about something”?", choices:["interrupt","stand up","describe","consider"], answer:3 },
  { id:"V14", q:"Which word means “in a way that pays close attention”?", choices:["besides","carefully","desperately","uncomfortably"], answer:1 },
  { id:"V16", q:"Which word means “responsible for what you do”?", choices:["curt","humiliated","resentful","accountable"], answer:3 },
  { id:"V18", q:"Which word means “in addition to what was already said”?", choices:["uncomfortably","besides","carefully","desperately"], answer:1 },
  { id:"V20", q:"Which word means “short and not friendly when speaking”?", choices:["respectful","accountable","humiliated","curt"], answer:3 },
  { id:"V22", q:"Which word means “to tell what someone or something is like”?", choices:["take charge","describe","advise","consider"], answer:1 },
  { id:"V24", q:"Which word means “to speak up for yourself or for someone else”?", choices:["worry","consider","describe","stand up"], answer:3 },
  /* ── PART II: WORD USAGE (review: 12 of the 24 words; the other 12 are on the test) ── */
  { id:"V25", q:tsInContext("Kim held the monkey bars with a firm grip so she would not slip.", "grip"), choices:["what is happening at a certain time","something that you did not expect","a tight hold on something","something that gives you an idea"], answer:2 },
  { id:"V27", q:tsInContext("The car ride was so long that my legs felt uncomfortably stiff.", "uncomfortably"), choices:["in a way that does not feel good","in a way that pays close attention","in addition to what was already said","in a way that shows you want something very badly"], answer:0 },
  { id:"V29", q:tsInContext("Grandpa was telling a joke, and my cousin tried to interrupt him before the funny part.", "interrupt"), choices:["to tell someone what you think he or she should do","to keep thinking that something bad might happen","to start talking before someone else is finished","to speak up for yourself or for someone else"], answer:2 },
  { id:"V31", q:tsInContext("It was Leo’s turn to sit in the front seat, so he was resentful when his sister took it.", "resentful"), choices:["feeling upset because something does not seem fair","feeling very embarrassed in front of other people","responsible for what you do","short and not friendly when speaking"], answer:0 },
  { id:"V33", q:tsInContext("Rita desperately wanted a puppy, so she asked her parents every single day.", "desperately"), choices:["in a way that pays close attention","in addition to what was already said","in a way that shows you want something very badly","in a way that does not feel good"], answer:2 },
  { id:"V35", q:tsInContext("Our class learned a jump rope routine with ten tricks to show our parents.", "routine"), choices:["a set of moves that you practice and then perform","a tight hold on something","something that you did not expect","one person alone, not a group"], answer:0 },
  { id:"V37", q:tsInContext("Gabe was humiliated after he called his teacher “Mom” and all his classmates giggled.", "humiliated"), choices:["showing that you care about other people and their ideas","responsible for what you do","feeling very embarrassed in front of other people","feeling upset because something does not seem fair"], answer:2 },
  { id:"V39", q:tsInContext("Ivan was respectful and waited quietly while his friend shared her idea.", "respectful"), choices:["showing that you care about other people and their ideas","short and not friendly when speaking","feeling very embarrassed in front of other people","feeling upset because something does not seem fair"], answer:0 },
  { id:"V41", q:tsInContext("The doctor will advise you to rest in bed until your cold is gone.", "advise"), choices:["to think carefully about something","to be the one who leads and decides what to do","to tell someone what you think he or she should do","to tell what someone or something is like"], answer:2 },
  { id:"V43", q:tsInContext("After Zoe read a whole chapter book by herself, she had more self-esteem.", "self-esteem"), choices:["the good feeling you have about yourself","something that gives you an idea","something that you did not expect","what is happening at a certain time"], answer:0 },
  { id:"V45", q:tsInContext("I worry that my goldfish will be hungry while we are away on our trip.", "worry"), choices:["to tell someone what you think he or she should do","to start talking before someone else is finished","to keep thinking that something bad might happen","to tell what someone or something is like"], answer:2 },
  { id:"V47", q:tsInContext("Dad came home early from his trip, and it was a happy surprise for all of us.", "surprise"), choices:["something that you did not expect","something that gives you an idea","a set of moves that you practice and then perform","a tight hold on something"], answer:0 },
];

window.COMP_BANK = [
  /* ── PART I: STORY DETAILS ────────────────────────── */
  { id:"P01", page:35, q:"When is the school talent show? (page 35)", choices:["in three weeks","in three days","after lunch today","at the end of the year"], answer:0 },
  { id:"P02", page:35, q:"The story says, “I shouted to my best friend.” Who is the “I” in this sentence? (page 35)", choices:["Maura","Tina","Maura’s brother","Maura’s grandmother"], answer:0 },
  { id:"P03", page:35, q:"Maura said, “I’ve got an idea and . . .” What did Tina do next? (page 35)", choices:["Tina interrupted her.","Tina listened to her idea.","Tina ran to the poster.","Tina walked away from her."], answer:0 },
  { id:"P04", page:35, q:"Maura desperately wanted to win, but it was more than that. How did Maura want to win? (page 35)", choices:["on her own, with an act all hers","with Tina, in a song and dance act","with her brother, in a magic act","with a small group of friends"], answer:0 },
  { id:"P05", page:36, q:"At lunch, Tina said she had it all planned out, and Maura said, “Yeah, that’s good.” What was Tina’s plan? (page 36)", choices:["sing along to a song and dance","juggle balls and tell some jokes","act out a scene from a TV show","read a poem and play some music"], answer:0 },
  { id:"P06", page:36, q:"At recess, Maura ran around the track a couple of times. Why did she do it? (page 36)", choices:["just to let off steam","to practice for the show","to win a race with Tina","to look for her grandmother"], answer:0 },
  { id:"P07", page:36, q:"When Maura’s grandmother picked her up after school, what did she finally say? (page 36)", choices:["“Cat got your tongue?”","“How was the talent show?”","“Did you have fun at lunch?”","“Where is your friend Tina?”"], answer:0 },
  { id:"P08", page:37, q:"Maura’s grandmother said to tell the truth. She said it will be good for what? (page 37)", choices:["Maura’s self-esteem","Maura’s math grade","Tina’s new costume","the dance routine"], answer:0 },
  { id:"P09", page:37, q:"Maura spent time worrying that Tina would be mad at her. How long did she worry? (page 37)", choices:["all night","a few minutes","all through lunch","for three weeks"], answer:0 },
  { id:"P10", page:37, q:"The biggest surprise came at recess. Who chose the game they played? (page 37)", choices:["Maura","Tina","the teacher","Maura’s grandmother"], answer:0 },
  /* ── PART II: INFERENCES, CONCLUSIONS, AND EVIDENCE (A/B pairs) ── */
  { id:"P11", page:35, q:"Part A: How does Maura feel when Tina asks about “our act”? (page 35)", choices:["uncomfortable about doing an act with Tina","excited about doing a fun act with Tina","sleepy and ready to go home after school","angry that the talent show is so soon"], answer:0 },
  { id:"P12", page:35, q:"Part B: Which sentence from page 35 best supports the answer to Part A?", choices:["“My grip on my books became uncomfortably tight.”","“Tina ran over to the bulletin board and read the poster.”","“My older brother had been teaching me juggling, and I knew he’d help me with my act for the show.”","“Tina interrupted me.”"], answer:0 },
  { id:"P13", page:35, q:"Part A: The Essential Question asks, “How do your actions affect others?” What can the reader conclude about how Tina’s actions affect Maura? (page 35)", choices:["When Tina takes charge, Maura ends up feeling resentful.","When Tina takes charge, Maura feels happy and thankful.","When Tina reads the poster, Maura feels proud of her.","When Tina makes plans, Maura wants to quit the show."], answer:0 },
  { id:"P14", page:35, q:"Part B: Which sentence from page 35 best supports the answer to Part A?", choices:["“The problem is Tina always takes charge, I don’t speak up, and then I end up feeling resentful about the whole situation.”","“During math, I tried to think of how I would tell Tina that I wanted to do my own act.”","“After all, we are best friends; we should be able to see eye to eye about this.”","“I wanted to win on my own—with an act that was all mine.”"], answer:0 },
  { id:"P15", page:36, q:"Part A: What can the reader infer about why Tina does not want to juggle? (page 36)", choices:["Tina is afraid she will look silly on stage.","Tina thinks juggling is too easy for the show.","Tina wants to juggle by herself, without Maura.","Tina thinks her mother cannot make costumes."], answer:0 },
  { id:"P16", page:36, q:"Part B: Which sentence from page 36 best supports the answer to Part A?", choices:["“We don’t want to be humiliated, right?”","“Tina considered it.”","“At lunch, Tina started talking as soon as we sat down.”","“I explained about the talent show as she listened carefully.”"], answer:0 },
  { id:"P17", page:36, q:"Part A: What can the reader conclude about what Maura’s grandmother thinks of the problem with Tina? (page 36)", choices:["Maura is part of the problem, too.","Tina is the whole problem, not Maura.","Maura should always do what Tina says.","Maura should stop being friends with Tina."], answer:0 },
  { id:"P18", page:36, q:"Part B: Which sentence from page 36 best supports the answer to Part A?", choices:["“I understand that you’re friends, but you’re still accountable for your own actions.”","“I explained about the talent show as she listened carefully.”","“At recess, I ran around the track a couple of times just to let off steam.”","“Tina considered it.”"], answer:0 },
  { id:"P19", page:37, q:"Part A: What can the reader conclude about Maura by the end of the story? (pages 35–37)", choices:["She learns to speak up for what she wants.","She learns to let Tina pick everything.","She decides that juggling is too hard.","She decides to join Tina’s dance act."], answer:0 },
  { id:"P20", page:37, q:"Part B: Which sentence from the story best supports the answer to Part A?", choices:["“When we got home, I took 12 deep breaths, called Tina, and told her that I was going to do my juggling act.”","“Tina ran over to the bulletin board and read the poster.”","“At recess, I ran around the track a couple of times just to let off steam.”","“Tina considered it.”"], answer:0 },
];

window.COMP_PAIRS = [['P11','P12'], ['P13','P14'], ['P15','P16'], ['P17','P18'], ['P19','P20']];

window.CLOZE_BANK = [
  { id:"C01", q:"The wet soap slipped out of my __________ and fell into the tub.", choices:["routine","grip","surprise"], answer:1 },
  { id:"C02", q:"This tiny tent fits only one __________, so my sister and I need two tents.", choices:["individual","situation","inspiration"], answer:0 },
  { id:"C03", q:"The sand at the beach was __________ hot, so I put on my flip-flops.", choices:["carefully","uncomfortably","desperately"], answer:1 },
  { id:"C04", q:"Ella __________ before she tasted the strange green soup.", choices:["consider","hesitated","describe"], answer:1 },
  { id:"C05", q:"Ava kept trying to __________ while the coach was explaining the new game.", choices:["interrupt","consider","describe"], answer:0 },
  { id:"C06", q:"Ms. Park asked Mateo to __________ of the blue team on field day.", choices:["describe","worry","take charge"], answer:2 },
  { id:"C07", q:"Max got a tiny slice of cake while his brother got a huge one, so Max felt __________.", choices:["resentful","respectful","accountable"], answer:0 },
  { id:"C08", q:"When the dog ran off with Dad’s shoe, it was a silly __________ for our whole family.", choices:["grip","situation","self-esteem"], answer:1 },
  { id:"C09", q:"Zack __________ wanted to see the end of the movie, but it was time for bed.", choices:["uncomfortably","carefully","desperately"], answer:2 },
  { id:"C10", q:"A funny dream gave Kai the __________ for a story about a flying fish.", choices:["inspiration","routine","situation"], answer:0 },
  { id:"C11", q:"At the dog show, Rex did a __________ of tricks: sit, spin, and roll over.", choices:["self-esteem","routine","situation"], answer:1 },
  { id:"C12", q:"Jen took a long time to __________ which shoes were best for running.", choices:["interrupt","consider","stand up"], answer:1 },
  { id:"C13", q:"Owen slipped on the ice at practice, and he was __________ when his whole team laughed.", choices:["accountable","respectful","humiliated"], answer:2 },
  { id:"C14", q:"Grace read the directions __________ so she would not make a mistake.", choices:["besides","carefully","uncomfortably"], answer:1 },
  { id:"C15", q:"Diego showed he was __________ by asking his friends what game they wanted to play.", choices:["respectful","curt","resentful"], answer:0 },
  { id:"C16", q:"Sam’s job is to water the plants, so he is __________ if they dry up.", choices:["resentful","accountable","respectful"], answer:1 },
  { id:"C17", q:"Our librarian likes to __________ kids on which books to read next.", choices:["describe","worry","advise"], answer:2 },
  { id:"C18", q:"My bike has a flat tire, and __________, it is too windy to ride.", choices:["besides","carefully","desperately"], answer:0 },
  { id:"C19", q:"Lucia believes in herself and has a lot of __________.", choices:["situation","self-esteem","routine"], answer:1 },
  { id:"C20", q:"The grumpy waiter was __________ and only said, “What do you want?”", choices:["respectful","accountable","curt"], answer:2 },
  { id:"C21", q:"Ming started to __________ that she left her homework on the bus.", choices:["worry","advise","describe"], answer:0 },
  { id:"C22", q:"Please __________ your favorite food so I can guess what it is.", choices:["advise","describe","worry"], answer:1 },
  { id:"C23", q:"Finding five dollars in the pocket of my old coat was a nice __________.", choices:["self-esteem","routine","surprise"], answer:2 },
  { id:"C24", q:"When kids made fun of Paco’s glasses, his friend Sara decided to __________ for him.", choices:["stand up","consider","interrupt"], answer:0 },
];
