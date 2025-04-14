"use client";

import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCustomerPersonas, CustomerPersona } from "@/services/customer-persona";
import { analyzeBottlenecks } from "@/ai/flows/analyze-bottlenecks";
import { generateRecommendations } from "@/ai/flows/generate-recommendations";
import { Button } from "@/components/ui/button";

interface FunnelStageProps {
  stageName: string;
  personas: CustomerPersona[];
  onPersonaDrop: (persona: CustomerPersona, targetStage: string) => void;
}

const FunnelStage: React.FC<FunnelStageProps> = ({ stageName, personas, onPersonaDrop }) => {
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const personaId = event.dataTransfer.getData("personaId");
    const droppedPersona = personas.find((p) => p.id === personaId);

    if (droppedPersona) {
      onPersonaDrop(droppedPersona, stageName);
    }
  };

  const allowDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{stageName}</CardTitle>
      </CardHeader>
      <CardContent
        onDrop={handleDrop}
        onDragOver={allowDrop}
        className="min-h-[100px] p-4 border-2 border-dashed rounded-md"
      >
        {personas.map((persona) => (
          <div key={persona.id} draggable="true" onDragStart={(e) => e.dataTransfer.setData("personaId", persona.id)} className="bg-secondary p-2 rounded-md mb-2">
            {persona.name}
          </div>
        ))}
        {personas.length === 0 && <p className="text-muted-foreground">Drag personas here</p>}
      </CardContent>
    </Card>
  );
};

export default function Home() {
  const [customerPersonas, setCustomerPersonas] = useState<CustomerPersona[]>([]);
  const [acquisition, setAcquisition] = useState<CustomerPersona[]>([    { id: "101", name: "Persona A" },    { id: "102", name: "Persona B" },    { id: "103", name: "Persona C" },  ]);
  const [activation, setActivation] = useState<CustomerPersona[]>([]);
  const [retention, setRetention] = useState<CustomerPersona[]>([]);
  const [referral, setReferral] = useState<CustomerPersona[]>([]);
  const [revenue, setRevenue] = useState<CustomerPersona[]>([]);
  const [bottleneckAnalysis, setBottleneckAnalysis] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    const loadPersonas = async () => {
      const personas = await getCustomerPersonas();
      setCustomerPersonas(personas);
    };

    loadPersonas();
  }, []);

  const handlePersonaDrop = (persona: CustomerPersona, targetStage: string) => {
    // Remove persona from all stages
    setAcquisition((prev) => prev.filter((p) => p.id !== persona.id));
    setActivation((prev) => prev.filter((p) => p.id !== persona.id));
    setRetention((prev) => prev.filter((p) => p.id !== persona.id));
    setReferral((prev) => prev.filter((p) => p.id !== persona.id));
    setRevenue((prev) => prev.filter((p) => p.id !== persona.id));

    // Add persona to target stage
    switch (targetStage) {
      case "Acquisition":
        setAcquisition((prev) => [...prev, persona]);
        break;
      case "Activation":
        setActivation((prev) => [...prev, persona]);
        break;
      case "Retention":
        setRetention((prev) => [...prev, persona]);
        break;
      case "Referral":
        setReferral((prev) => [...prev, persona]);
        break;
      case "Revenue":
        setRevenue((prev) => [...prev, persona]);
        break;
    }
  };

  const analyzeFunnel = async () => {
    const funnelData = {
      Acquisition: acquisition.map(persona => ({ persona, count: 1 })),
      Activation: activation.map(persona => ({ persona, count: 1 })),
      Retention: retention.map(persona => ({ persona, count: 1 })),
      Referral: referral.map(persona => ({ persona, count: 1 })),
      Revenue: revenue.map(persona => ({ persona, count: 1 })),
    };

    const analysis = await analyzeBottlenecks(funnelData);
    setBottleneckAnalysis(analysis.bottlenecks);
  };

  const generatePersonaRecommendations = async () => {
    if (customerPersonas.length === 0) return;

    const persona = customerPersonas[0]; // Use the first persona for demonstration
    const recs = await generateRecommendations({
      customerPersona: persona,
      funnelStage: "Acquisition", // Example funnel stage
    });
    setRecommendations(recs.recommendations);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <SidebarProvider>
        <Sidebar className="w-64">
          <SidebarHeader>
            <h2 className="text-lg font-semibold">METRO Pirate Funnel</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Customer Personas</SidebarGroupLabel>
              <SidebarMenu>
                {customerPersonas.map((persona) => (
                  <SidebarMenuItem key={persona.id}>
                    <SidebarMenuButton>{persona.name}</SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <Button onClick={analyzeFunnel}>Analyze Funnel</Button>
            <Button onClick={generatePersonaRecommendations}>Get Recommendations</Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Pirate Funnel Simulation</h1>
            <div className="grid grid-cols-5 gap-4">
              <FunnelStage stageName="Acquisition" personas={acquisition} onPersonaDrop={handlePersonaDrop} />
              <FunnelStage stageName="Activation" personas={activation} onPersonaDrop={handlePersonaDrop} />
              <FunnelStage stageName="Retention" personas={retention} onPersonaDrop={handlePersonaDrop} />
              <FunnelStage stageName="Referral" personas={referral} onPersonaDrop={handlePersonaDrop} />
              <FunnelStage stageName="Revenue" personas={revenue} onPersonaDrop={handlePersonaDrop} />
            </div>
            <h2 className="text-xl font-bold mt-8">Bottleneck Analysis</h2>
            <ul>
              {bottleneckAnalysis.map((bottleneck, index) => (
                <li key={index}>{bottleneck}</li>
              ))}
            </ul>
            <h2 className="text-xl font-bold mt-8">Recommendations</h2>
            <ul>
              {recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DndProvider>
  );
}
