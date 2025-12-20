import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const VirtualTryOn = () => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const mannequinRef = useRef(null);
  const controlsRef = useRef(null);
  const clothingMeshesRef = useRef({});
  const animationFrameRef = useRef(null);
  
  const [selectedCategory, setSelectedCategory] = useState('tops');
  const [bodyMetrics, setBodyMetrics] = useState({
    height: 170,
    chest: 90,
    waist: 75,
    hips: 95,
    shoulders: 40
  });
  const [wornClothing, setWornClothing] = useState({
    top: null,
    bottom: null,
    shoes: null
  });
  const [draggedItem, setDraggedItem] = useState(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  // Product catalog with realistic colors
  const products = {
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

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f0);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 3);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Renderer
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

    // Hemisphere for soft, skin-friendly lighting
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
    // push the floor slightly down so shoes/feet remain visible
    const floorOffset = -0.2 * (bodyMetrics.height / 170);
    floor.position.y = floorOffset;
    floor.receiveShadow = true;
    scene.add(floor);

    // Create mannequin
    createMannequin(scene, bodyMetrics);

    // Controls (enable drag-to-rotate and autorotate)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 1.2;
    // focus on mannequin chest height (approx)
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

    // Handle window resize
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
  }, []);

  // Update mannequin when body metrics change
  useEffect(() => {
    if (sceneRef.current && mannequinRef.current) {
      sceneRef.current.remove(mannequinRef.current);
      createMannequin(sceneRef.current, bodyMetrics);
      
      // Re-apply worn clothing
      Object.keys(wornClothing).forEach(type => {
        if (wornClothing[type]) {
          updateClothing(type, wornClothing[type]);
        }
      });
      // Update controls target to new mannequin center
      if (controlsRef.current) {
        const heightScale = bodyMetrics.height / 170;
        controlsRef.current.target.set(0, 1.1 * heightScale, 0);
        controlsRef.current.update();
      }
    }
  }, [bodyMetrics]);

  // Sync autorotate toggling with OrbitControls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isRotating;
    }
  }, [isRotating]);

  const createMannequin = (scene, metrics) => {
    const mannequinGroup = new THREE.Group();
    
    // Scale factors based on body metrics
    const heightScale = metrics.height / 170;
    const chestScale = metrics.waist / 75;  // SWAPPED
    const waistScale = metrics.chest / 90;  // SWAPPED
    const hipScale = metrics.hips / 95;
    const shoulderScale = metrics.shoulders / 40;

    // Clean, modern skin material
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xE8D4C8,
      roughness: 0.6,
      metalness: 0.1,
      flatShading: false
    });

    // HEAD - Simple sphere
    const headGeometry = new THREE.SphereGeometry(0.13 * heightScale, 32, 32);
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 1.65 * heightScale;
    head.castShadow = true;
    mannequinGroup.add(head);

    // NECK - Smooth cylinder
    const neckGeometry = new THREE.CylinderGeometry(
      0.055 * heightScale, 
      0.065 * heightScale, 
      0.12 * heightScale, 
      32
    );
    const neck = new THREE.Mesh(neckGeometry, skinMaterial);
    neck.position.y = 1.53 * heightScale;
    neck.castShadow = true;
    mannequinGroup.add(neck);

    // TORSO - Single unified piece using LatheGeometry for smooth transitions
    const torsoPoints = [];
    const torsoSegments = 80;
    const torsoHeight = 0.75 * heightScale;
    
    for (let i = 0; i <= torsoSegments; i++) {
      const t = i / torsoSegments;
      const y = torsoHeight * (t - 0.5);
      
      let radius;
      if (t < 0.1) {
        // Neck to shoulders transition
        radius = THREE.MathUtils.lerp(0.065 * heightScale, 0.16 * chestScale, t / 0.1);
      } else if (t < 0.35) {
        // Upper chest area - controlled by chest (which is wider)
        const localT = (t - 0.1) / 0.25;
        radius = THREE.MathUtils.lerp(0.16 * chestScale, 0.18 * chestScale, localT);
      } else if (t < 0.55) {
        // Mid chest - peak chest width
        radius = 0.18 * chestScale;
      } else if (t < 0.75) {
        // Tapering to waist - controlled by waist (which is narrower)
        const localT = (t - 0.55) / 0.2;
        radius = THREE.MathUtils.lerp(0.18 * chestScale, 0.135 * waistScale, localT);
      } else {
        // Waist expanding to hips
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

    // SHOULDERS - Rounded caps
    const shoulderGeometry = new THREE.SphereGeometry(0.065 * shoulderScale, 24, 24);
    
    const leftShoulder = new THREE.Mesh(shoulderGeometry, skinMaterial);
    leftShoulder.position.set(-0.215 * shoulderScale, 1.43 * heightScale, 0);
    leftShoulder.castShadow = true;
    mannequinGroup.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeometry, skinMaterial);
    rightShoulder.position.set(0.215 * shoulderScale, 1.43 * heightScale, 0);
    rightShoulder.castShadow = true;
    mannequinGroup.add(rightShoulder);

    // ARMS - Smooth tapered using LatheGeometry
    const armPoints = [];
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
    const forearmPoints = [];
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

    // HANDS - Slightly elongated spheres
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

    // LEGS - Smooth tapered from hips to ankles
    const legPoints = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const y = 0.95 * heightScale * (t - 0.5);
      let radius;
      if (t < 0.45) {
        // Thigh - controlled by hip scale
        radius = THREE.MathUtils.lerp(0.082 * hipScale, 0.062, t / 0.45);
      } else if (t < 0.55) {
        // Knee area
        radius = 0.06;
      } else {
        // Calf tapering down
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

    // FEET - Rounded boxes
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

    // Elevate entire mannequin slightly above ground
    mannequinGroup.position.y = 0.15 * heightScale;

    mannequinRef.current = mannequinGroup;
    scene.add(mannequinGroup);
  };

  const updateClothing = (type, item) => {
    if (!mannequinRef.current || !sceneRef.current || !item) return;

    // Remove existing clothing of this type
    if (clothingMeshesRef.current[type]) {
      mannequinRef.current.remove(clothingMeshesRef.current[type]);
    }

    const heightScale = bodyMetrics.height / 170;
    const chestScale = bodyMetrics.waist / 75;  // SWAPPED to match mannequin
    const waistScale = bodyMetrics.chest / 90;  // SWAPPED to match mannequin
    const hipScale = bodyMetrics.hips / 95;
    const shoulderScale = bodyMetrics.shoulders / 40;

    const clothingMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(item.color),
      roughness: item.fabric === 'Leather' ? 0.35 : item.fabric === 'Silk' ? 0.18 : 0.65,
      metalness: item.fabric === 'Leather' ? 0.25 : 0.0,
      clearcoat: item.fabric === 'Silk' ? 0.12 : 0.0,
      clearcoatRoughness: 0.4
    });

    let clothingMesh;

    if (type === 'top') {
      // Create shirt/top - Matches torso exactly but slightly larger to cover
      const topGroup = new THREE.Group();
      
      const topPoints = [];
      const topSegments = 80;
      const topHeight = 0.84 * heightScale;  // Extends from neck to below waist
      
      for (let i = 0; i <= topSegments; i++) {
        const t = i / topSegments;
        const y = topHeight * (t - 0.5);
        
        let radius;
        if (t < 0.08) {
          // Neck area - covers the neck
          radius = THREE.MathUtils.lerp(0.068 * heightScale, 0.175 * chestScale, t / 0.08);
        } else if (t < 0.32) {
          // Upper chest - follows chest dimensions
          const localT = (t - 0.08) / 0.24;
          radius = THREE.MathUtils.lerp(0.175 * chestScale, 0.195 * chestScale, localT);
        } else if (t < 0.52) {
          // Peak chest area
          radius = 0.195 * chestScale;
        } else if (t < 0.72) {
          // Tapering to waist
          const localT = (t - 0.52) / 0.2;
          radius = THREE.MathUtils.lerp(0.195 * chestScale, 0.15 * waistScale, localT);
        } else {
          // Lower waist to hips area
          const localT = (t - 0.72) / 0.28;
          radius = THREE.MathUtils.lerp(0.15 * waistScale, 0.175 * hipScale, localT);
        }
        
        topPoints.push(new THREE.Vector2(radius, y));
      }
      
      const bodyGeometry = new THREE.LatheGeometry(topPoints, 36);
      const body = new THREE.Mesh(bodyGeometry, clothingMaterial);
      body.position.y = 1.14 * heightScale;  // Positioned to cover from neck down
      body.castShadow = true;
      topGroup.add(body);

      // Sleeves - Match arm dimensions
      const sleevePoints = [];
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
      // Create pants/bottoms - Matches leg dimensions exactly
      const bottomGroup = new THREE.Group();

      // Hip/Waist band - covers top of hips
      const waistGeometry = new THREE.CylinderGeometry(
        0.175 * hipScale,
        0.175 * hipScale,
        0.14 * heightScale,
        36
      );
      const waistBand = new THREE.Mesh(waistGeometry, clothingMaterial);
      waistBand.position.y = 0.7 * heightScale;
      waistBand.castShadow = true;
      bottomGroup.add(waistBand);

      // Pants legs - perfectly match leg geometry
      const pantsLegPoints = [];
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const y = 0.98 * heightScale * (t - 0.5);
        let radius;
        if (t < 0.44) {
          // Thigh area - matches hip-scaled thighs
          radius = THREE.MathUtils.lerp(0.088 * hipScale, 0.068, t / 0.44);
        } else if (t < 0.54) {
          // Knee area
          radius = 0.066;
        } else {
          // Calf area - tapers down
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
      // Create shoes - Match foot dimensions and position
      const shoesGroup = new THREE.Group();

      const shoeGeometry = new THREE.BoxGeometry(0.082, 0.062, 0.18, 8, 4, 10);
      const positions = shoeGeometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        // Round toe area
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

  const handleDragStart = (e, item, category) => {
    setDraggedItem({ item, category });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
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

  const handleTryOn = (item, category) => {
    const clothingType = category === 'tops' ? 'top' : category === 'bottoms' ? 'bottom' : 'shoes';
    
    setWornClothing(prev => ({
      ...prev,
      [clothingType]: item
    }));
    
    updateClothing(clothingType, item);
  };

  const handleRemove = (type) => {
    if (clothingMeshesRef.current[type] && mannequinRef.current) {
      mannequinRef.current.remove(clothingMeshesRef.current[type]);
      clothingMeshesRef.current[type] = null;
    }
    
    setWornClothing(prev => ({
      ...prev,
      [type]: null
    }));
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #fdfbf7 0%, #f5f1e8 100%)',
      fontFamily: '"Spectral", serif',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #d4c4a8, transparent)'
      }} />
      
      {/* Header */}
      <header style={{
        padding: '2rem 3rem',
        borderBottom: '1px solid rgba(212, 196, 168, 0.3)',
        background: 'rgba(253, 251, 247, 0.9)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '2.5rem',
            fontWeight: 400,
            letterSpacing: '0.05em',
            color: '#2c2416',
            fontFamily: '"Playfair Display", serif'
          }}>
            ATELIER
          </h1>
          <div style={{
            fontSize: '0.875rem',
            letterSpacing: '0.15em',
            color: '#8b7355',
            fontWeight: 300
          }}>
            VIRTUAL FITTING ROOM
          </div>
        </div>
      </header>

      <div style={{
        display: 'flex',
        height: 'calc(100vh - 100px)',
        gap: 0
      }}>
        {/* Left Panel - Controls */}
        <div style={{
          width: '320px',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(212, 196, 168, 0.3)',
          padding: '2rem',
          overflowY: 'auto',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.02)'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 400,
            letterSpacing: '0.1em',
            color: '#2c2416',
            marginBottom: '2rem',
            textTransform: 'uppercase',
            borderBottom: '1px solid rgba(212, 196, 168, 0.4)',
            paddingBottom: '1rem'
          }}>
            Body Measurements
          </h3>

          {Object.entries(bodyMetrics).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '1.75rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
                fontSize: '0.875rem',
                letterSpacing: '0.05em',
                color: '#5c4d3a'
              }}>
                <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                  {key}
                </span>
                <span style={{ 
                  fontFamily: '"Courier New", monospace',
                  color: '#8b7355'
                }}>
                  {value} {key === 'height' ? 'cm' : 'cm'}
                </span>
              </div>
              <input
                type="range"
                min={key === 'height' ? 150 : key === 'shoulders' ? 35 : 60}
                max={key === 'height' ? 200 : key === 'shoulders' ? 50 : 130}
                value={value}
                onChange={(e) => setBodyMetrics(prev => ({
                  ...prev,
                  [key]: parseInt(e.target.value)
                }))}
                style={{
                  width: '100%',
                  height: '2px',
                  background: 'linear-gradient(90deg, #d4c4a8, #8b7355)',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  borderRadius: '2px'
                }}
              />
            </div>
          ))}

          <div style={{ marginTop: '3rem' }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 400,
              letterSpacing: '0.1em',
              color: '#2c2416',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              borderBottom: '1px solid rgba(212, 196, 168, 0.4)',
              paddingBottom: '1rem'
            }}>
              Current Outfit
            </h3>

            {['top', 'bottom', 'shoes'].map(type => (
              <div key={type} style={{
                marginBottom: '1rem',
                padding: '1rem',
                background: wornClothing[type] ? 'rgba(212, 196, 168, 0.15)' : 'rgba(255, 255, 255, 0.5)',
                borderRadius: '4px',
                border: '1px solid rgba(212, 196, 168, 0.3)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  color: '#8b7355',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase'
                }}>
                  {type}
                </div>
                {wornClothing[type] ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#2c2416' }}>
                      {wornClothing[type].name}
                    </div>
                    <button
                      onClick={() => handleRemove(type)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        background: 'rgba(0, 0, 0, 0.05)',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        letterSpacing: '0.05em',
                        color: '#5c4d3a',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(0, 0, 0, 0.05)';
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#a89579',
                    fontStyle: 'italic'
                  }}>
                    Not selected
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsRotating(!isRotating)}
            style={{
              width: '100%',
              marginTop: '2rem',
              padding: '1rem',
              background: isRotating ? 'rgba(139, 115, 85, 0.2)' : 'rgba(212, 196, 168, 0.2)',
              border: '1px solid rgba(139, 115, 85, 0.4)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              letterSpacing: '0.1em',
              color: '#2c2416',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              fontWeight: 500
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(139, 115, 85, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = isRotating ? 'rgba(139, 115, 85, 0.2)' : 'rgba(212, 196, 168, 0.2)';
            }}
          >
            {isRotating ? '⏸ Pause Rotation' : '▶ Auto Rotate'}
          </button>
        </div>

        {/* Center Panel - 3D Canvas */}
        <div 
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '2rem'
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div style={{
            position: 'absolute',
            top: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.875rem',
            letterSpacing: '0.15em',
            color: '#a89579',
            textAlign: 'center',
            zIndex: 5
          }}>
            DRAG & DROP ITEMS HERE
            <div style={{
              marginTop: '0.5rem',
              width: '40px',
              height: '1px',
              background: '#d4c4a8',
              margin: '0.5rem auto 0'
            }} />
          </div>

          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '8px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
              background: 'linear-gradient(135deg, #faf9f5 0%, #f0ebe0 100%)'
            }}
          />
        </div>

        {/* Right Panel - Products */}
        <div style={{
          width: '380px',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(212, 196, 168, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.02)'
        }}>
          {/* Category Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid rgba(212, 196, 168, 0.3)',
            background: 'rgba(253, 251, 247, 0.8)'
          }}>
            {['tops', 'bottoms', 'shoes'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  flex: 1,
                  padding: '1.25rem 1rem',
                  background: selectedCategory === cat ? 'rgba(212, 196, 168, 0.2)' : 'transparent',
                  border: 'none',
                  borderBottom: selectedCategory === cat ? '2px solid #8b7355' : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  letterSpacing: '0.1em',
                  color: selectedCategory === cat ? '#2c2416' : '#8b7355',
                  textTransform: 'uppercase',
                  fontWeight: selectedCategory === cat ? 600 : 400,
                  transition: 'all 0.3s ease',
                  fontFamily: '"Spectral", serif'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat) {
                    e.target.style.background = 'rgba(212, 196, 168, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem'
          }}>
            {products[selectedCategory].map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item, selectedCategory)}
                style={{
                  marginBottom: '1.25rem',
                  padding: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(212, 196, 168, 0.4)',
                  borderRadius: '6px',
                  cursor: 'grab',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.borderColor = '#8b7355';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(212, 196, 168, 0.4)';
                }}
              >
                {/* Color swatch */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background: item.color
                }} />

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem'
                }}>
                  <div>
                    <h4 style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '1.125rem',
                      fontWeight: 500,
                      color: '#2c2416',
                      letterSpacing: '0.02em'
                    }}>
                      {item.name}
                    </h4>
                    <div style={{
                      fontSize: '0.75rem',
                      letterSpacing: '0.1em',
                      color: '#8b7355',
                      textTransform: 'uppercase'
                    }}>
                      {item.fabric}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#2c2416'
                  }}>
                    ${item.price}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '1rem'
                }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      background: item.color,
                      borderRadius: '4px',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  
                  <button
                    onClick={() => handleTryOn(item, selectedCategory)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, #2c2416 0%, #3d3022 100%)',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#f5f1e8',
                      fontSize: '0.875rem',
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      transition: 'all 0.3s ease',
                      fontFamily: '"Spectral", serif'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.02)';
                      e.target.style.boxShadow = '0 4px 12px rgba(44, 36, 22, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    Try On
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '0.75rem',
        letterSpacing: '0.15em',
        color: '#a89579',
        textAlign: 'center',
        opacity: 0.7
      }}>
        Drag items to mannequin or click "Try On" • Adjust body measurements on the left
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Spectral:wght@300;400;500;600&display=swap');
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #8b7355;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }
        
        input[type="range"]::-webkit-slider-thumb:hover {
          background: #6d5940;
          transform: scale(1.15);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #8b7355;
          cursor: pointer;
          border-radius: 50%;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }
        
        input[type="range"]::-moz-range-thumb:hover {
          background: #6d5940;
          transform: scale(1.15);
        }
        
        *::-webkit-scrollbar {
          width: 8px;
        }
        
        *::-webkit-scrollbar-track {
          background: rgba(212, 196, 168, 0.1);
        }
        
        *::-webkit-scrollbar-thumb {
          background: rgba(139, 115, 85, 0.4);
          border-radius: 4px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 115, 85, 0.6);
        }
      `}</style>
    </div>
  );
};

export default VirtualTryOn;