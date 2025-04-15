import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { sessionId, message } = await request.json()

    if (!sessionId || !message) {
      return NextResponse.json({ error: "Missing sessionId or message" }, { status: 400 })
    }

    // Generate AI response based on the user's message
    // In a real application, you would call your AI service here
    let aiResponse = "I'm your AI Tutor. "

    if (message.toLowerCase().includes("dna")) {
      if (message.toLowerCase().includes("replication")) {
        aiResponse +=
          "DNA replication is the process where DNA makes a copy of itself. It begins when the enzyme helicase unwinds and separates the two strands of the double helix. Each separated strand serves as a template for a new complementary strand. The enzyme DNA polymerase adds nucleotides to the growing strands, following the base-pairing rules (A with T, G with C). This results in two identical DNA molecules, each containing one original strand and one new strand, a process called semiconservative replication."
      } else if (message.toLowerCase().includes("structure")) {
        aiResponse +=
          "DNA's double helix structure consists of two strands that wind around each other like a twisted ladder. The sides of the ladder are made of alternating sugar (deoxyribose) and phosphate groups, while the rungs are pairs of nitrogenous bases: Adenine (A) pairs with Thymine (T), and Guanine (G) pairs with Cytosine (C). These base pairs are held together by hydrogen bonds."
      } else if (message.toLowerCase().includes("mutation")) {
        aiResponse +=
          "DNA mutations are changes in the DNA sequence that can alter genetic information. Mutations can occur due to errors during DNA replication, exposure to mutagens like UV radiation or chemicals, or from viral infections. There are several types of mutations including substitutions (where one base is replaced by another), insertions (addition of nucleotides), deletions (removal of nucleotides), and frameshift mutations (which alter the reading frame of genes). While many mutations are harmful or neutral, some can provide evolutionary advantages."
      } else if (message.toLowerCase().includes("medicine")) {
        aiResponse +=
          "DNA technology has revolutionized medicine in numerous ways. Applications include genetic testing to identify disease risks, pharmacogenomics to personalize medication, gene therapy to treat genetic disorders, DNA fingerprinting in forensics, and the development of recombinant DNA technologies for producing insulin and other therapeutic proteins. The recent CRISPR-Cas9 gene editing technology has opened up new possibilities for treating previously incurable genetic diseases."
      } else {
        aiResponse +=
          "DNA (deoxyribonucleic acid) is the genetic material in humans and almost all other organisms. Nearly every cell in a person's body has the same DNA. DNA is made up of four chemical bases: adenine (A), guanine (G), cytosine (C), and thymine (T). The information in DNA is stored as a code made up of these four chemical bases, which form specific pairs (A with T, G with C) to create the double helix structure."
      }
    } else if (message.toLowerCase().includes("enzyme")) {
      aiResponse +=
        "Enzymes are biological molecules (typically proteins) that significantly speed up the rate of virtually all of the chemical reactions that take place within cells. They are vital for life and serve a wide range of important functions in the body, such as aiding in digestion and metabolism. Enzymes work by lowering the activation energy required for reactions to occur. The molecules upon which enzymes act are called substrates, and each enzyme is specific to its particular substrate."
    } else if (message.toLowerCase().includes("cell division")) {
      aiResponse +=
        "Cell division is the process by which a parent cell divides into two or more daughter cells. There are two main types of cell division: mitosis and meiosis. Mitosis is the process where a single cell divides into two identical daughter cells with the same number of chromosomes. This is important for growth, repair, and asexual reproduction. Meiosis, on the other hand, is the type of cell division that creates egg and sperm cells, reducing the chromosome number by half to create genetically unique cells for sexual reproduction."
    } else {
      aiResponse +=
        "I'd be happy to help you learn about that topic. Could you provide more details about what you'd like to know? I can explain concepts in biology, chemistry, physics, mathematics, and many other subjects."
    }

    // Store AI response in Supabase
    const { error } = await supabase.from("chat_messages").insert([
      {
        session_id: sessionId,
        sender: "ai",
        content: aiResponse,
      },
    ])

    if (error) {
      console.error("Error storing AI response:", error)
      return NextResponse.json({ error: "Failed to store AI response" }, { status: 500 })
    }

    // Update the session's updated_at timestamp
    await supabase.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error generating AI response:", error)
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 })
  }
}
