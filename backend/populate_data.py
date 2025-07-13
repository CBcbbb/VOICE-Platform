from models import Node, Link
from models.db import SessionLocal
import uuid


def generate_link_id():
    return str(uuid.uuid4())[:8]


def populate_database():
    db = SessionLocal()

    # Clear existing data
    print("Clearing existing data...")
    db.query(Link).delete()
    db.query(Node).delete()

    # Your original hardcoded data
    nodes_data = [
        # People data (9 nodes)
        {
            "id": "P001",
            "name": "Jakob Kukula",
            "type": "People",
            "bio": "Jakob Kukula is a multidisciplinary creator, working in the fields of art, design and music. Born and raised in Berlin, he is life-long influenced by the city's thriving scenes. After finishing his product design studies at the Bauhaus University in Weimar, that included abroad experiences at the Pratt Institute, NY and working with Studio Drift in Amsterdam, he returned to Berlin where he worked two years with the Studio Olafur Eliasson and finished his MA Thesis at KHB Weißensee. As Founder of SpreeBerlin and Symbiotic lab, he currently explores a planet-centric practice; questioning the relationship between humans and nature, seeking ways to reconnect and suggesting ideas for transformation by combining art, design and science.",
            "website": "https://www.spreeberlin.de/",
            "connections": "Waag (Lead Mentor)"
        },
        {
            "id": "P002",
            "name": "Marina Wainer",
            "type": "People",
            "bio": "Marina Wainer is a Paris-based artist. For the last 20 years she has been making interactive art, at the nexus of creation, technology and society. Her work explores societal issues and spaces of representation, with a sensitive approach, imagining experiences where the audience is at the heart of the work. The interaction proposed in her projects, which encourages participation, has turned into collaboration, involving the public upstream and working with various communities. Throughout the years, Wainer has been developing transdisciplinary collaborations with artists, researchers and scientists.",
            "website": "http://marinaestelawainer.com",
            "connections": "Waag (Lead Mentor)"
        },
        {
            "id": "P003",
            "name": "Anna Dumitriu",
            "type": "People",
            "bio": "Anna Dumitriu is an award winning internationally renowned British artist who works with BioArt, sculpture, installation, and digital media to explore our relationship to healthcare, climate-change and emerging technologies. Past exhibitions include ZKM, Ars Electronica, BOZAR, The Picasso Museum, HeK Basel, Nobel Prize Museum, MOCA Taipei, LABoral, Art Laboratory Berlin, and Eden Project. Anna's work has featured in significant publications including Frieze, Artforum International Magazine, Leonardo Journal, The Art Newspaper, Nature and The Lancet.",
            "website": "https://annadumitriu.co.uk/",
            "connections": "INOVA (Lead Mentor)"
        },
        {
            "id": "P004",
            "name": "Lucie Hernandez",
            "type": "People",
            "bio": "Lucie's work explores the production and consumption of fashion and textile products and the role of craft to contribute more sustainable, responsible and durable practices. Lucie holds a background in human-computer interaction, designing tangible interfaces for embodied interaction. Her PhD investigated craft practice in the design of electronic textiles (E-Textiles) for embodied interaction. Lucie addressed sustainable practices for smart textiles in environmental and social contexts for WEAR Sustain, an EU Horizon 2020 Research and Development Programme.",
            "website": "touchcraft.org.uk",
            "connections": "RCA (Lead Mentor)"
        },
        {
            "id": "P005",
            "name": "Gayil Nalls",
            "type": "People",
            "bio": "Gayil Nalls, Ph.D. is an interdisciplinary artist, writer, and theorist. Nalls is best known for the world olfactory social sculpture World Sensorium, a statically based composition of phytogentic materials. World Sensorium, an ongoing work of scale and complexity, premiered in New York during the Times Square 2000 celebrations, released onto the crowd of two million participants. The work was featured in Washington D.C.'s Millennium Around the World gala, the Vatican's Millennium Jubilee in Rome, Italy, and was endorsed by UNESCO as a project of peace and goodwill.",
            "website": "worldsensorium.com",
            "connections": "UCD (Lead Mentor)"
        },

        # Institutions data (5 main ones)
        {
            "id": "I001",
            "name": "Waag Futurelab",
            "type": "Institutions",
            "bio": "Waag is a research institute for technology and society. We create technologies that have a positive impact on society. Through research and design, we develop new technologies and applications that contribute to more livable cities, fair algorithms, and technologies that help people.",
            "website": "https://waag.org/"
        },
        {
            "id": "I002",
            "name": "Royal College of Art",
            "type": "Institutions",
            "bio": "The Royal College of Art is a public research university in London, United Kingdom, specialising in art and design. It offers postgraduate degrees in art and design to students from over 60 countries. The RCA is consistently ranked as the world's leading university for art and design.",
            "website": "https://www.rca.ac.uk/"
        },
        {
            "id": "I003",
            "name": "University College Dublin",
            "type": "Institutions",
            "bio": "University College Dublin is a public research university in Dublin, Ireland, and a member institution of the National University of Ireland. It is Ireland's largest university with over 38,000 students, and is highly ranked internationally.",
            "website": "https://www.ucd.ie/"
        },
        {
            "id": "I004",
            "name": "NEoN Digital Arts",
            "type": "Institutions",
            "bio": "NEoN Digital Arts (SCIO) advocates for digital art and technology while at the same time addressing the negatives aspects that can often arise from their use. We provide access to expertise and equipment in a safe, inclusive environment, using free, open-source or low cost software while simultaneously explaining the ethical issues surrounding their construction, use and disposal.",
            "website": "https://neondigitalarts.com/"
        },
        {
            "id": "I005",
            "name": "Access Space",
            "type": "Institutions",
            "bio": "Access Space is an arts and education organisation, where people interested in art, design, computers, recycling, music, electronics, photography and more, meet like-minded people, share and develop skills. We engage with and encourage a very broad section of the community to get involved with artistic, creative and technical projects.",
            "website": "https://access-space.org/"
        },

        # Projects data (5 main ones)
        {
            "id": "PR001",
            "name": "RiverSync",
            "type": "Projects",
            "description": "Jakob Kukula's RiverSync is a transdisciplinary artistic intervention focused on river systems as ecological, legal, and cultural actors. Over the course of six months, RiverSync used participatory design, environmental sensing, and community storytelling to foster new relationships between urban residents, river systems, and legal frameworks. The project was centred on the Spree River in Berlin but extended to include international connections with water justice movements.",
            "budget": "12,000 Euros",
            "methods": "Participatory speculative workshops, River-centred meditation, Legal Moots and Rights of the Spree - Legal Co-design for Framework development, Participatory mapping, Storytelling and Platform work, Sensor Module Design, The Diplomatic Suitcase",
            "involved_institutions": "Horizon Europe VOICE Project, European Union Grant Agreement No.101135803"
        },
        {
            "id": "PR002",
            "name": "Synocene — beyond the Anthropocene",
            "type": "Projects",
            "description": "Synocene is a collaborative work that explores a de-centred view of our anthropocentric experience of the natural world. Voices of local communities, the sounds of Natura 2000 forests, and the contributions of artificial intelligence all work to imagine a future beyond the Anthropocene. Artist Marina Wainer's Synocene took place in Ulvenhout Forest, a protected nature reserve in the Netherlands.",
            "budget": "12,000 Euros",
            "methods": "Nature walks (Reflective sound walks using binaural recordings), Participatory Speculative Design, Interactive / Conversational dialogues with AI-generated forest beings, Reflective / Co-created storytelling and co-created narratives, Multilingual interface, Sound recordings / sound data collection",
            "involved_institutions": "Horizon Europe VOICE Project, European Union Grant Agreement No.101135803"
        },
        {
            "id": "PR003",
            "name": "Greening the Lab: Decarbonising Biomedical Science",
            "type": "Projects",
            "description": "Anna Dumitriu's project, Greening the Lab: Decarbonising Biomedical Science (GTL), is an art-led response to the ecological footprint of the biomedical sector. The artistic intervention responds to an urgent need from the biomedical research community to create novel solutions and increase stakeholder support via their patient and public engagement (PPE) communities for artist-led actions towards decarbonisation of biomedical science and healthcare settings.",
            "budget": "12,000 Euros",
            "website": "https://annadumitriu.co.uk/portfolio/greening-the-lab-decarbonising-biomedical-science/",
            "methods": "Participatory art - hands-on art-making workshops, Storytelling and Open dialogue, Critical Making and Co-creative sessions, Experimental biomaterial processing, Open-source protocols, Strategic Dissemination at Symposiums and Public Events",
            "involved_institutions": "Brighton and Sussex Medical School, University of Leeds, University of Oxford, Horizon Europe VOICE Project"
        },
        {
            "id": "PR004",
            "name": "Mammory Mountain",
            "type": "Projects",
            "description": "An intimate performative VR experience that explores 'dis-ease' within the body through the experience of breast cancer. This interactive experience told the stories of patient healthcare struggles, particularly on the hidden experiences of breast cancer treatment. This artwork was presented through a combination of interactive VR art installation and creative methodologies, audiences experienced the stories of survivors, the treatments, and the often unspoken effects of the journey.",
            "website": "https://mammary-vr.art/",
            "methods": "Experience Design, VR Development, Community Storytelling, Haptic Feedback Design",
            "involved_institutions": "NEoN Digital Arts, Access Space, Leitrim Sculpture Centre, Creative Heartlands"
        },
        {
            "id": "PR005",
            "name": "World Sensorium: Ireland - Connecting Europe",
            "type": "Projects",
            "description": "World Sensorium Ireland is a sensory-based, interdisciplinary, art project led by Gayil Nalls that explores olfactory heritage as a critical component of environmental awareness, cultural identity, and community participation. Rooted in the landscape and plant life of Ireland, the project draws attention to endangered sensory experiences and fosters multi-generational engagement with the ecological and cultural transformations associated with the decline of turf (peat) usage.",
            "budget": "12,000 Euros",
            "methods": "Narrative Inquiry, Ethnographic Film Screening, Participatory Symposium, Sensory Immersion, QR-Coded Digital Polling, Dissemination Channels",
            "involved_institutions": "Horizon Europe VOICE Project",
            "website": "https://worldsensorium.com/world-sensorium-ireland-project/"
        },

        # Methods data (4 main ones)
        {
            "id": "M001",
            "name": "Forest Walking and Conversational Encounters Workshop Method",
            "type": "Methods",
            "description": "The Forest Walking Method is an immersive, participatory, sound-integrated and reflective artistic approach designed to explore human and more-than-human relationships through walking, listening, and conversational exchange. It centres on ecological awareness, immersive sound and characters, collaborative dialogue, and the imaginative use of AI to activate forest environments as playful, co-creative spaces for active ecological engagement and reflections.",
            "category": "Environmental",
            "steps": "1. Preparation and Scouting: Establish key locations and connections\n2. Stakeholder Mapping and Communication: Create zone maps to visualise relationships\n3. Sound Collection and AI Generation: Record ambient sounds and develop AI characters\n4. Forest Workshop: Conduct walking sessions with binaural recordings\n5. Debrief, Reflection and Documentation: Gather feedback and archive responses\n6. Post-Workshop Creation and Legacy: Create outputs and share with communities",
            "challenges": "Ethical engagement and community consent; Technical adaptation to local conditions; Weather dependencies; Cultural sensitivity in AI character development",
            "links": "https://dl.acm.org/doi/abs/10.1145/3613905.3637118"
        },
        {
            "id": "M002",
            "name": "Generative Felting and Biomaterial Workshopping Method",
            "type": "Methods",
            "description": "The Felting and Biomaterial Workshopping Method uses recycled lab and medical materials to create art-based workshops that invite participants into hands-on making, reflective discussion and playful exploration. It blends wet and dry felting, biomaterial crafting, and facilitated conversation to provoke new ways of seeing waste, contamination, care, and reuse in clinical and research settings.",
            "category": "Material Arts",
            "challenges": "Safety protocols for handling medical waste; Material sourcing and preparation; Contamination concerns; Participant comfort with medical materials; Ensuring proper sterilization processes",
            "conditions": "Access to sterilized medical waste materials; Proper safety equipment and protocols; Workshop space with good ventilation; Experienced facilitators with knowledge of both art and medical safety"
        },
        {
            "id": "M003",
            "name": "Experience Design",
            "type": "Methods",
            "description": "Reappropriated from the web and interaction design processes to create a participatory, performative and immersive practice, this method combines physical interaction, storytelling, haptics and emotional engagement. This method intersects digital art, performance, immersive storytelling, feminist healthcare activism, interaction design and VR technology.",
            "category": "Digital Technology",
            "steps": "1. Topic selection and funding: Start with story-driven concept\n2. Community outreach: Engage those with lived experience\n3. Consent and data gathering: Record stories with clear protocols\n4. Team assembly: Include technologists, designers, animators\n5. Interaction and experience design: Map audience journey\n6. Prototype and test: Especially wearable and haptic elements\n7. Build and deploy: Design immersive environment\n8. Exhibition and caretaking: Manage emotional responses",
            "challenges": "Technical failure during performances; Emotional triggering of sensitive content; Community access barriers; Data ethics and consent management; Balancing technology with human experience"
        },
        {
            "id": "M004",
            "name": "Inclusive Design",
            "type": "Methods",
            "description": "Inclusive Design is a philosophy, movement and methodology that aims to centre those traditionally excluded from design and cultural processes. It is an approach used by designers, artists, community workers, researchers, educators, and practitioners who want to engage with diverse perspectives to produce artworks or outcomes that are usable, respectful and co-owned by the people they aim to serve.",
            "category": "Inclusive Design",
            "challenges": "Avoiding tokenism and superficial inclusion; Managing power dynamics in collaborative processes; Ensuring authentic participation rather than consultation; Resource constraints and funding limitations; Balancing different community needs and perspectives; Maintaining long-term relationships beyond project timelines",
            "conditions": "Commitment to genuine power sharing; Flexible timelines that accommodate community schedules; Accessible meeting spaces and formats; Budget for participant compensation; Cultural competency training for team members; Clear agreements about authorship and ownership"
        }
    ]

    # Add all nodes
    print("Adding nodes...")
    for node_data in nodes_data:
        node = Node(**node_data)
        db.add(node)

    # Links data - using your original relationships
    links_data = [
        # People to Projects - Leadership relationships
        {"id": generate_link_id(), "source_id": "P001", "target_id": "PR001", "relationship_type": "leads",
         "strength": 1.0},
        {"id": generate_link_id(), "source_id": "P002", "target_id": "PR002", "relationship_type": "leads",
         "strength": 1.0},
        {"id": generate_link_id(), "source_id": "P003", "target_id": "PR003", "relationship_type": "leads",
         "strength": 1.0},
        {"id": generate_link_id(), "source_id": "P005", "target_id": "PR005", "relationship_type": "leads",
         "strength": 1.0},

        # Projects to Methods - Application relationships
        {"id": generate_link_id(), "source_id": "PR002", "target_id": "M001", "relationship_type": "applies",
         "strength": 0.9},
        {"id": generate_link_id(), "source_id": "PR003", "target_id": "M002", "relationship_type": "applies",
         "strength": 0.9},
        {"id": generate_link_id(), "source_id": "PR004", "target_id": "M003", "relationship_type": "applies",
         "strength": 1.0},

        # People to Methods - Development relationships
        {"id": generate_link_id(), "source_id": "P002", "target_id": "M001", "relationship_type": "develops",
         "strength": 0.8},
        {"id": generate_link_id(), "source_id": "P003", "target_id": "M002", "relationship_type": "develops",
         "strength": 0.8},
        {"id": generate_link_id(), "source_id": "P004", "target_id": "M004", "relationship_type": "uses",
         "strength": 0.6},

        # People to Institutions - Affiliation relationships
        {"id": generate_link_id(), "source_id": "P001", "target_id": "I001", "relationship_type": "mentored_by",
         "strength": 0.7},
        {"id": generate_link_id(), "source_id": "P002", "target_id": "I001", "relationship_type": "mentored_by",
         "strength": 0.7},
        {"id": generate_link_id(), "source_id": "P004", "target_id": "I002", "relationship_type": "mentored_by",
         "strength": 0.7},
        {"id": generate_link_id(), "source_id": "P005", "target_id": "I003", "relationship_type": "mentored_by",
         "strength": 0.7},

        # Institutions to Projects - Support relationships
        {"id": generate_link_id(), "source_id": "I004", "target_id": "PR004", "relationship_type": "supports",
         "strength": 0.7},
        {"id": generate_link_id(), "source_id": "I005", "target_id": "PR004", "relationship_type": "supports",
         "strength": 0.7},
        {"id": generate_link_id(), "source_id": "I001", "target_id": "PR001", "relationship_type": "supports",
         "strength": 0.8},
        {"id": generate_link_id(), "source_id": "I001", "target_id": "PR002", "relationship_type": "supports",
         "strength": 0.8},
        {"id": generate_link_id(), "source_id": "I002", "target_id": "PR004", "relationship_type": "supports",
         "strength": 0.8},
        {"id": generate_link_id(), "source_id": "I003", "target_id": "PR005", "relationship_type": "supports",
         "strength": 0.8},
    ]

    # Add all links
    print("Adding links...")
    for link_data in links_data:
        link = Link(**link_data)
        db.add(link)

    # Commit all changes
    db.commit()
    db.close()

    print(f"✅ Database populated successfully!")
    print(f"   - Added {len(nodes_data)} nodes")
    print(f"   - Added {len(links_data)} links")
    print("   - Ready to use with your React frontend!")


if __name__ == "__main__":
    populate_database()