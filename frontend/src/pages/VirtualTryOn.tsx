import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Play, Pause, Sparkles } from 'lucide-react';

interface ClothingItem {
  id: string;
  name: string;
  color: string;
  price: number;
  fabric: string;
}

interface BodyMetrics {
  height: number;
  chest: number;
  waist: number;
  hips: number;
  shoulders: number;
}

interface WornClothing {
  top: ClothingItem | null;
  bottom: ClothingItem | null;
  shoes: ClothingItem | null;
}

const VirtualTryOn: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const mannequinRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const clothingMeshesRef = useRef<Record<string, THREE.Group | null>>({});
  const animationFrameRef = useRef<number | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<'tops' | 'bottoms' | 'shoes'>('tops');
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetrics>({
    height: 170,
    chest: 90,
    waist: 75,
    hips: 95,
    shoulders: 40
  });
  const [wornClothing, setWornClothing] = useState<WornClothing>({
    top: null,
    bottom: null,
    shoes: null
  });
  const [draggedItem, setDraggedItem] = useState<{ item: ClothingItem; category: string } | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  // Product catalog with realistic colors
  const products: Record<string, ClothingItem[]> = {
    tops: [
      { id: 't1', name: 'Silk Blouse', color: '#F8E8D8', price: 89, fabric: 'Silk' },
      { id: 't2', name: 'Cotton Tee', color: '#2C3E50', price: 29, fabric: 'Cotton' },
      { id: 't3', name: 'Denim Jacket', color: '#4A5D7F', price: 129, fabric: 'Denim' },
      { id: 't4', name: 'Wool Sweater', color: '#8B4513', price: 99, fabric: 'Wool' },
      { id: 't5', name: 'Linen Shirt', color: '#FAFAFA', price: 79, fabric: 'Linen' },
      { id: 't6', name: 'Leather Jacket', color: '#1A1A1A', price: 299, fabric: 'Leather' }
    ],
    bottoms: [
      { id: 'b1', name: 'Slim Jeans', color: '#2B4560', price: 89, fabric: 'Denim' },
      { id: 'b2', name: 'Chinos', color: '#C9B497', price: 69, fabric: 'Cotton' },
      { id: 'b3', name: 'Cargo Pants', color: '#3D4F3A', price: 79, fabric: 'Canvas' },
      { id: 'b4', name: 'Dress Pants', color: '#1C1C1C', price: 99, fabric: 'Wool' },
      { id: 'b5', name: 'Joggers', color: '#696969', price: 59, fabric: 'Fleece' }
    ],
    shoes: [
      { id: 's1', name: 'Sneakers', color: '#FFFFFF', price: 129, fabric: 'Synthetic' },
      { id: 's2', name: 'Loafers', color: '#654321', price: 159, fabric: 'Leather' },
      { id: 's3', name: 'Boots', color: '#2C1810', price: 189, fabric: 'Leather' },
      { id: 's4', name: 'Sandals', color: '#D2B48C', price: 49, fabric: 'Leather' }
    ]
  };

  const createMannequin = (scene: THREE.Scene, metrics: BodyMetrics) => {
    const mannequinGroup = new THREE.Group();
    
    const heightScale = metrics.height / 170;
    const chestScale = metrics.waist / 75;
    const waistScale = metrics.chest / 90;
    const hipScale = metrics.hips / 95;
    const shoulderScale = metrics.shoulders / 40;

    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xE8D4C8,
      roughness: 0.6,
      metalness: 0.1,
      flatShading: false
    });

    // HEAD
    const headGeometry = new THREE.SphereGeometry(0.13 * heightScale, 32, 32);
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 1.65 * heightScale;
    head.castShadow = true;
    mannequinGroup.add(head);

    // NECK
    const neckGeometry = new THREE.CylinderGeometry(0.055 * heightScale, 0.065 * heightScale, 0.12 * heightScale, 32);
    const neck = new THREE.Mesh(neckGeometry, skinMaterial);
    neck.position.y = 1.53 * heightScale;
    neck.castShadow = true;
    mannequinGroup.add(neck);

    // TORSO using LatheGeometry
    const torsoPoints: THREE.Vector2[] = [];
    const torsoSegments = 80;
    const torsoHeight = 0.75 * heightScale;
    
    for (let i = 0; i <= torsoSegments; i++) {
      const t = i / torsoSegments;
      const y = torsoHeight * (t - 0.5);
      
      let radius;
      if (t < 0.1) {
        radius = THREE.MathUtils.lerp(0.065 * heightScale, 0.16 * chestScale, t / 0.1);
      } else if (t < 0.35) {
        const localT = (t - 0.1) / 0.25;
        radius = THREE.MathUtils.lerp(0.16 * chestScale, 0.18 * chestScale, localT);
      } else if (t < 0.55) {
        radius = 0.18 * chestScale;
      } else if (t < 0.75) {
        const localT = (t - 0.55) / 0.2;
        radius = THREE.MathUtils.lerp(0.18 * chestScale, 0.135 * waistScale, localT);
      } else {
        const localT = (t - 0.75) / 0.25;
        radius = THREE.MathUtils.lerp(0.135 * waistScale, 0.16 * hipScale, localT);
      }
      
      torsoPoints.push(new THREE.Vector2(radius, y));
    }
    
    const torsoGeometry = new THREE.LatheGeometry(torsoPoints, 48);
    const torso = new THREE.Mesh(torsoGeometry, skinMaterial);
    torso.position.y = 1.095 * heightScale;
    torso.castShadow = true;
    mannequinGroup.add(torso);

    // SHOULDERS
    const shoulderGeometry = new THREE.SphereGeometry(0.065 * shoulderScale, 24, 24);
    
    const leftShoulder = new THREE.Mesh(shoulderGeometry, skinMaterial);
    leftShoulder.position.set(-0.215 * shoulderScale, 1.43 * heightScale, 0);
    leftShoulder.castShadow = true;
    mannequinGroup.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeometry, skinMaterial);
    rightShoulder.position.set(0.215 * shoulderScale, 1.43 * heightScale, 0);
    rightShoulder.castShadow = true;
    mannequinGroup.add(rightShoulder);

    // ARMS
    const armPoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      const y = 0.48 * heightScale * (t - 0.5);
      const radius = THREE.MathUtils.lerp(0.042, 0.036, t);
      armPoints.push(new THREE.Vector2(radius, y));
    }
    const armGeometry = new THREE.LatheGeometry(armPoints, 24);
    
    const leftArm = new THREE.Mesh(armGeometry, skinMaterial);
    leftArm.position.set(-0.22 * shoulderScale, 1.14 * heightScale, 0);
    leftArm.castShadow = true;
    mannequinGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, skinMaterial);
    rightArm.position.set(0.22 * shoulderScale, 1.14 * heightScale, 0);
    rightArm.castShadow = true;
    mannequinGroup.add(rightArm);

    // FOREARMS
    const forearmPoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      const y = 0.43 * heightScale * (t - 0.5);
      const radius = THREE.MathUtils.lerp(0.036, 0.031, t);
      forearmPoints.push(new THREE.Vector2(radius, y));
    }
    const forearmGeometry = new THREE.LatheGeometry(forearmPoints, 24);
    
    const leftForearm = new THREE.Mesh(forearmGeometry, skinMaterial);
    leftForearm.position.set(-0.22 * shoulderScale, 0.66 * heightScale, 0);
    leftForearm.castShadow = true;
    mannequinGroup.add(leftForearm);

    const rightForearm = new THREE.Mesh(forearmGeometry, skinMaterial);
    rightForearm.position.set(0.22 * shoulderScale, 0.66 * heightScale, 0);
    rightForearm.castShadow = true;
    mannequinGroup.add(rightForearm);

    // HANDS
    const handGeometry = new THREE.SphereGeometry(0.035, 16, 16);
    handGeometry.scale(1, 1.2, 0.7);
    
    const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
    leftHand.position.set(-0.22 * shoulderScale, 0.42 * heightScale, 0);
    leftHand.castShadow = true;
    mannequinGroup.add(leftHand);

    const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
    rightHand.position.set(0.22 * shoulderScale, 0.42 * heightScale, 0);
    rightHand.castShadow = true;
    mannequinGroup.add(rightHand);

    // LEGS
    const legPoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const y = 0.95 * heightScale * (t - 0.5);
      let radius;
      if (t < 0.45) {
        radius = THREE.MathUtils.lerp(0.082 * hipScale, 0.062, t / 0.45);
      } else if (t < 0.55) {
        radius = 0.06;
      } else {
        radius = THREE.MathUtils.lerp(0.06, 0.046, (t - 0.55) / 0.45);
      }
      legPoints.push(new THREE.Vector2(radius, y));
    }
    const legGeometry = new THREE.LatheGeometry(legPoints, 32);
    
    const leftLeg = new THREE.Mesh(legGeometry, skinMaterial);
    leftLeg.position.set(-0.095 * hipScale, 0.245 * heightScale, 0);
    leftLeg.castShadow = true;
    mannequinGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, skinMaterial);
    rightLeg.position.set(0.095 * hipScale, 0.245 * heightScale, 0);
    rightLeg.castShadow = true;
    mannequinGroup.add(rightLeg);

    // FEET
    const footGeometry = new THREE.BoxGeometry(0.075, 0.055, 0.17, 8, 4, 8);
    const footPositions = footGeometry.attributes.position;
    for (let i = 0; i < footPositions.count; i++) {
      const x = footPositions.getX(i);
      const z = footPositions.getZ(i);
      if (Math.abs(z) > 0.06) {
        footPositions.setX(i, x * 0.85);
      }
    }
    footGeometry.computeVertexNormals();
    
    const leftFoot = new THREE.Mesh(footGeometry, skinMaterial);
    leftFoot.position.set(-0.095 * hipScale, -0.23 * heightScale, 0.04);
    leftFoot.castShadow = true;
    mannequinGroup.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeometry, skinMaterial);
    rightFoot.position.set(0.095 * hipScale, -0.23 * heightScale, 0.04);
    rightFoot.castShadow = true;
    mannequinGroup.add(rightFoot);

    mannequinGroup.position.y = 0.15 * heightScale;

    mannequinRef.current = mannequinGroup;
    scene.add(mannequinGroup);
  };

  const updateClothing = (type: string, item: ClothingItem) => {
    if (!mannequinRef.current || !sceneRef.current) return;

    // Remove existing clothing of this type
    if (clothingMeshesRef.current[type]) {
      mannequinRef.current.remove(clothingMeshesRef.current[type]!);
    }

    const heightScale = bodyMetrics.height / 170;
    const chestScale = bodyMetrics.waist / 75;
    const waistScale = bodyMetrics.chest / 90;
    const hipScale = bodyMetrics.hips / 95;
    const shoulderScale = bodyMetrics.shoulders / 40;

    const clothingMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(item.color),
      roughness: item.fabric === 'Leather' ? 0.35 : item.fabric === 'Silk' ? 0.18 : 0.65,
      metalness: item.fabric === 'Leather' ? 0.25 : 0.0,
      clearcoat: item.fabric === 'Silk' ? 0.12 : 0.0,
      clearcoatRoughness: 0.4
    });

    let clothingMesh: THREE.Group | null = null;

    if (type === 'top') {
      const topGroup = new THREE.Group();
      
      const topPoints: THREE.Vector2[] = [];
      const topSegments = 80;
      const topHeight = 0.84 * heightScale;
      
      for (let i = 0; i <= topSegments; i++) {
        const t = i / topSegments;
        const y = topHeight * (t - 0.5);
        
        let radius;
        if (t < 0.08) {
          radius = THREE.MathUtils.lerp(0.068 * heightScale, 0.175 * chestScale, t / 0.08);
        } else if (t < 0.32) {
          const localT = (t - 0.08) / 0.24;
          radius = THREE.MathUtils.lerp(0.175 * chestScale, 0.195 * chestScale, localT);
        } else if (t < 0.52) {
          radius = 0.195 * chestScale;
        } else if (t < 0.72) {
          const localT = (t - 0.52) / 0.2;
          radius = THREE.MathUtils.lerp(0.195 * chestScale, 0.15 * waistScale, localT);
        } else {
          const localT = (t - 0.72) / 0.28;
          radius = THREE.MathUtils.lerp(0.15 * waistScale, 0.175 * hipScale, localT);
        }
        
        topPoints.push(new THREE.Vector2(radius, y));
      }
      
      const bodyGeometry = new THREE.LatheGeometry(topPoints, 36);
      const body = new THREE.Mesh(bodyGeometry, clothingMaterial);
      body.position.y = 1.14 * heightScale;
      body.castShadow = true;
      topGroup.add(body);

      // Sleeves
      const sleevePoints: THREE.Vector2[] = [];
      for (let i = 0; i <= 28; i++) {
        const t = i / 28;
        const y = 0.5 * heightScale * (t - 0.5);
        const radius = THREE.MathUtils.lerp(0.05, 0.044, t);
        sleevePoints.push(new THREE.Vector2(radius, y));
      }
      const sleeveGeometry = new THREE.LatheGeometry(sleevePoints, 20);
      
      const leftSleeve = new THREE.Mesh(sleeveGeometry, clothingMaterial);
      leftSleeve.position.set(-0.22 * shoulderScale, 1.14 * heightScale, 0);
      leftSleeve.castShadow = true;
      topGroup.add(leftSleeve);

      const rightSleeve = new THREE.Mesh(sleeveGeometry, clothingMaterial);
      rightSleeve.position.set(0.22 * shoulderScale, 1.14 * heightScale, 0);
      rightSleeve.castShadow = true;
      topGroup.add(rightSleeve);

      clothingMesh = topGroup;
    } else if (type === 'bottom') {
      const bottomGroup = new THREE.Group();

      // Waist band
      const waistGeometry = new THREE.CylinderGeometry(0.175 * hipScale, 0.175 * hipScale, 0.14 * heightScale, 36);
      const waistBand = new THREE.Mesh(waistGeometry, clothingMaterial);
      waistBand.position.y = 0.7 * heightScale;
      waistBand.castShadow = true;
      bottomGroup.add(waistBand);

      // Pants legs
      const pantsLegPoints: THREE.Vector2[] = [];
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const y = 0.98 * heightScale * (t - 0.5);
        let radius;
        if (t < 0.44) {
          radius = THREE.MathUtils.lerp(0.088 * hipScale, 0.068, t / 0.44);
        } else if (t < 0.54) {
          radius = 0.066;
        } else {
          radius = THREE.MathUtils.lerp(0.066, 0.053, (t - 0.54) / 0.46);
        }
        pantsLegPoints.push(new THREE.Vector2(radius, y));
      }
      const pantsLegGeometry = new THREE.LatheGeometry(pantsLegPoints, 28);
      
      const leftLeg = new THREE.Mesh(pantsLegGeometry, clothingMaterial);
      leftLeg.position.set(-0.095 * hipScale, 0.24 * heightScale, 0);
      leftLeg.castShadow = true;
      bottomGroup.add(leftLeg);

      const rightLeg = new THREE.Mesh(pantsLegGeometry, clothingMaterial);
      rightLeg.position.set(0.095 * hipScale, 0.24 * heightScale, 0);
      rightLeg.castShadow = true;
      bottomGroup.add(rightLeg);

      clothingMesh = bottomGroup;
    } else if (type === 'shoes') {
      const shoesGroup = new THREE.Group();

      const shoeGeometry = new THREE.BoxGeometry(0.082, 0.062, 0.18, 8, 4, 10);
      const positions = shoeGeometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        if (Math.abs(z) > 0.07) {
          positions.setX(i, x * 0.82);
        }
      }
      shoeGeometry.computeVertexNormals();
      
      const leftShoe = new THREE.Mesh(shoeGeometry, clothingMaterial);
      leftShoe.position.set(-0.095 * hipScale, -0.23 * heightScale, 0.04);
      leftShoe.castShadow = true;
      shoesGroup.add(leftShoe);

      const rightShoe = new THREE.Mesh(shoeGeometry, clothingMaterial);
      rightShoe.position.set(0.095 * hipScale, -0.23 * heightScale, 0.04);
      rightShoe.castShadow = true;
      shoesGroup.add(rightShoe);

      clothingMesh = shoesGroup;
    }

    if (clothingMesh) {
      clothingMeshesRef.current[type] = clothingMesh;
      mannequinRef.current.add(clothingMesh);
    }
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f0);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 3);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const hemi = new THREE.HemisphereLight(0xfff7ee, 0x444444, 0.35);
    scene.add(hemi);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    // Floor
    const floorGeometry = new THREE.CircleGeometry(3, 64);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xe8e8e0,
      roughness: 0.8,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    const floorOffset = -0.2 * (bodyMetrics.height / 170);
    floor.position.y = floorOffset;
    floor.receiveShadow = true;
    scene.add(floor);

    createMannequin(scene, bodyMetrics);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 1.2;
    controls.target.set(0, (bodyMetrics.height / 170) * 1.1, 0);
    controls.update();
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update mannequin when body metrics change
  useEffect(() => {
    if (sceneRef.current && mannequinRef.current) {
      sceneRef.current.remove(mannequinRef.current);
      createMannequin(sceneRef.current, bodyMetrics);
      
      Object.keys(wornClothing).forEach(type => {
        const key = type as keyof WornClothing;
        if (wornClothing[key]) {
          updateClothing(type, wornClothing[key]!);
        }
      });

      if (controlsRef.current) {
        const heightScale = bodyMetrics.height / 170;
        controlsRef.current.target.set(0, 1.1 * heightScale, 0);
        controlsRef.current.update();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyMetrics]);

  // Sync autorotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isRotating;
    }
  }, [isRotating]);

  const handleDragStart = (e: React.DragEvent, item: ClothingItem, category: string) => {
    setDraggedItem({ item, category });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedItem) {
      const { item, category } = draggedItem;
      const clothingType = category === 'tops' ? 'top' : category === 'bottoms' ? 'bottom' : 'shoes';
      
      setWornClothing(prev => ({
        ...prev,
        [clothingType]: item
      }));
      
      updateClothing(clothingType, item);
      setDraggedItem(null);
    }
  };

  const handleTryOn = (item: ClothingItem, category: string) => {
    const clothingType = category === 'tops' ? 'top' : category === 'bottoms' ? 'bottom' : 'shoes';
    
    setWornClothing(prev => ({
      ...prev,
      [clothingType]: item
    }));
    
    updateClothing(clothingType, item);
  };

  const handleRemove = (type: keyof WornClothing) => {
    if (clothingMeshesRef.current[type] && mannequinRef.current) {
      mannequinRef.current.remove(clothingMeshesRef.current[type]!);
      clothingMeshesRef.current[type] = null;
    }
    
    setWornClothing(prev => ({
      ...prev,
      [type]: null
    }));
  };

  const formatPrice = (price: number) => `₹${price}`;

  return (
    <>
      <Helmet>
        <title>Virtual Try-On (Beta) - ApparelDesk</title>
        <meta name="description" content="Try clothes virtually with our 3D fitting room. Drag and drop items to see how they look on you." />
      </Helmet>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          {/* Header with Beta Badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Virtual Try-On</h1>
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Beta
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm hidden md:block">
              Drag items to the mannequin or click "Try On" to preview
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel - Body Measurements */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Body Measurements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(bodyMetrics).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize font-medium">{key}</span>
                        <span className="text-muted-foreground font-mono">{value} cm</span>
                      </div>
                      <Slider
                        value={[value]}
                        min={key === 'height' ? 150 : key === 'shoulders' ? 35 : 60}
                        max={key === 'height' ? 200 : key === 'shoulders' ? 50 : 130}
                        step={1}
                        onValueChange={([newValue]) => setBodyMetrics(prev => ({ ...prev, [key]: newValue }))}
                      />
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Current Outfit</h4>
                    {(['top', 'bottom', 'shoes'] as const).map(type => (
                      <div key={type} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <span className="text-xs text-muted-foreground uppercase">{type}</span>
                          <p className="text-sm font-medium">
                            {wornClothing[type]?.name || 'Not selected'}
                          </p>
                        </div>
                        {wornClothing[type] && (
                          <Button variant="ghost" size="sm" onClick={() => handleRemove(type)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsRotating(!isRotating)}
                  >
                    {isRotating ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {isRotating ? 'Pause Rotation' : 'Auto Rotate'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Center Panel - 3D Canvas */}
            <div className="lg:col-span-5">
              <Card className="h-[600px] overflow-hidden">
                <div
                  className="relative h-full"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-center">
                    <span className="text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
                      Drag & Drop Items Here
                    </span>
                  </div>
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                  />
                </div>
              </Card>
            </div>

            {/* Right Panel - Products */}
            <div className="lg:col-span-4">
              <Card className="h-[600px] flex flex-col">
                <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as typeof selectedCategory)} className="flex flex-col h-full">
                  <TabsList className="grid grid-cols-3 mx-4 mt-4">
                    <TabsTrigger value="tops">Tops</TabsTrigger>
                    <TabsTrigger value="bottoms">Bottoms</TabsTrigger>
                    <TabsTrigger value="shoes">Shoes</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    <TabsContent value={selectedCategory} className="mt-0 space-y-3">
                      {products[selectedCategory].map(item => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item, selectedCategory)}
                          className="p-4 border rounded-lg cursor-grab hover:shadow-md transition-shadow bg-card relative overflow-hidden group"
                        >
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-xs text-muted-foreground uppercase">{item.fabric}</p>
                            </div>
                            <span className="font-mono font-semibold">{formatPrice(item.price)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <div
                              className="w-8 h-8 rounded border shadow-sm"
                              style={{ backgroundColor: item.color }}
                            />
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleTryOn(item, selectedCategory)}
                            >
                              Try On
                            </Button>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>
            </div>
          </div>

          {/* Footer hint */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Drag items to mannequin or click "Try On" • Adjust body measurements on the left • Use mouse to rotate the view
          </p>
        </div>
      </Layout>
    </>
  );
};

export default VirtualTryOn;
