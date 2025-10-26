import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Coffee,
  UtensilsCrossed,
  Landmark,
  Building2,
  ShoppingBag,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBf-NRa94w7uEiP5UAVnuC4UOzyLaiHiMs",
  authDomain: "izmir-oyku.firebaseapp.com",
  projectId: "izmir-oyku",
  storageBucket: "izmir-oyku.firebasestorage.app",
  messagingSenderId: "941717806849",
  appId: "1:941717806849:web:d21f94a1295028a2de0500",
  measurementId: "G-84Y7QFSWGS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const CULTURAL_SITES = [
  {
    id: "kordon",
    name: "Kordon",
    type: "landmark",
    coordinates: [27.138, 38.4192],
    description:
      "Historic waterfront promenade, symbol of İzmir's modern identity",
    image:
      "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=400&h=300&fit=crop",
    initialLikes: 0,
  },
  {
    id: "agora",
    name: "Ancient Agora",
    type: "historical",
    coordinates: [27.14, 38.418],
    description: "Roman marketplace ruins from 2nd century AD",
    image:
      "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=400&h=300&fit=crop",
    initialLikes: 0,
  },
  {
    id: "kemeralti",
    name: "Kemeraltı Bazaar",
    type: "shopping",
    coordinates: [27.13081, 38.41921],
    description: "Traditional marketplace dating back to the 17th century",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    initialLikes: 0,
  },
  {
    id: "boyoz-cafe",
    name: "Traditional Boyoz Place",
    type: "restaurant",
    coordinates: [27.142, 38.423],
    description: "Famous for İzmir's iconic pastry - Boyoz",
    image:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop",
    initialLikes: 0,
  },
  {
    id: "asansor",
    name: "Historical Elevator",
    type: "landmark",
    coordinates: [27.127, 38.428],
    description: "Built in 1907, connects lower and upper parts of the city",
    image:
      "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400&h=300&fit=crop",
    initialLikes: 0,
  },
  {
    id: "alsancak",
    name: "Alsancak Neighborhood",
    type: "cafe",
    coordinates: [27.145, 38.436],
    description: "Vibrant cultural district with cafes and historic buildings",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop",
    initialLikes: 0,
  },
  {
    id: "ACI",
    name: "American Collegiate Institute",
    type: "landmark",
    coordinates: [27.08974, 38.39501],
    description: "Historic educational institution with beautiful architecture",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop",
    initialLikes: 0,
  },
  {
    id: "Hiltown",
    name: "Hiltown Alışveriş Merkezi",
    type: "shopping",
    coordinates: [27.07395, 38.47836],
    description: "Karşıyaka'da modern alışveriş deneyimi sunan merkez",
    image:
      "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=400&h=300&fit=crop",
    initialLikes: 0,
  },
];

const ICON_MAP = {
  restaurant: UtensilsCrossed,
  cafe: Coffee,
  landmark: Landmark,
  historical: Building2,
  shopping: ShoppingBag,
  photo: Sparkles,
};

const COLOR_MAP = {
  restaurant: "#ef4444",
  cafe: "#f59e0b",
  landmark: "#3b82f6",
  historical: "#8b5cf6",
  shopping: "#ec4899",
  photo: "#10b981",
};

if (
  typeof document !== "undefined" &&
  !document.getElementById("custom-marker-styles")
) {
  const style = document.createElement("style");
  style.id = "custom-marker-styles";
  style.textContent = `
    .cultural-marker {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 2.5px solid white;
      will-change: width, height, box-shadow;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transition: width 0.3s ease, height 0.3s ease, box-shadow 0.3s ease;
    }
    
    .cultural-marker:hover {
      width: 44px;
      height: 44px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.15);
      z-index: 100;
    }
    
    .cultural-marker.active {
      width: 44px;
      height: 44px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), 0 4px 8px rgba(0, 0, 0, 0.15);
      border-width: 3px;
    }
    
    .cultural-marker svg {
      color: white;
      width: 22px;
      height: 22px;
      filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.2));
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    
    .cultural-marker:hover svg,
    .cultural-marker.active svg {
      opacity: 1;
    }

    .maplibregl-popup-content {
      padding: 0 !important;
      border-radius: 12px !important;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
      background: white;
      opacity: 0;
      transform: translateY(10px) scale(0.95);
      animation: popupFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      margin-bottom: 12px;
    }
    
    @keyframes popupFadeIn {
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .maplibregl-popup-close-button {
      display: none !important;
    }
    
    .maplibregl-popup-tip {
      border-top-color: white !important;
    }
  `;
  document.head.appendChild(style);
}

const ImageUploadModal = ({ isOpen, onClose, onImageUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB");
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const timestamp = Date.now();
      const filename = `images/${timestamp}-${file.name}`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      onImageUploaded(downloadURL);
      onClose();
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        "Failed to upload. Make sure Storage is enabled in Firebase Console!\n\nGo to: Build → Storage → Get Started"
      );
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Upload Image</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all"
            >
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 font-medium mb-2">
                Click to upload image
              </p>
              <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div>
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-xl mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Choose Different
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const createCulturalMarker = (site, onClick) => {
  const el = document.createElement("div");
  el.className = "cultural-marker";
  el.style.backgroundColor = COLOR_MAP[site.type] || "#3b82f6";

  const Icon = ICON_MAP[site.type] || Sparkles;
  const root = createRoot(el);
  root.render(<Icon size={22} strokeWidth={2} />);

  el.addEventListener("click", onClick);
  return el;
};

const createPopupContent = (site, onClose) => {
  const container = document.createElement("div");
  container.style.width = "340px";
  container.style.fontFamily = "system-ui, -apple-system, sans-serif";
  container.style.position = "relative";

  const img = document.createElement("img");
  img.src = site.image;
  img.alt = site.name;
  img.style.width = "100%";
  img.style.height = "220px";
  img.style.objectFit = "cover";
  img.style.display = "block";
  img.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";

  container.addEventListener("mouseenter", () => {
    img.style.transform = "scale(1.05)";
  });
  container.addEventListener("mouseleave", () => {
    img.style.transform = "scale(1)";
  });

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "×";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "12px";
  closeBtn.style.right = "12px";
  closeBtn.style.width = "32px";
  closeBtn.style.height = "32px";
  closeBtn.style.borderRadius = "50%";
  closeBtn.style.background = "rgba(0, 0, 0, 0.6)";
  closeBtn.style.backdropFilter = "blur(10px)";
  closeBtn.style.border = "none";
  closeBtn.style.color = "white";
  closeBtn.style.fontSize = "24px";
  closeBtn.style.fontWeight = "300";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.display = "flex";
  closeBtn.style.alignItems = "center";
  closeBtn.style.justifyContent = "center";
  closeBtn.style.transition = "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
  closeBtn.style.lineHeight = "1";
  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.background = "rgba(0, 0, 0, 0.8)";
    closeBtn.style.transform = "scale(1.1) rotate(90deg)";
  });
  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.background = "rgba(0, 0, 0, 0.6)";
    closeBtn.style.transform = "scale(1)";
  });
  closeBtn.addEventListener("click", onClose);

  const content = document.createElement("div");
  content.style.padding = "20px";

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.alignItems = "flex-start";
  header.style.justifyContent = "space-between";
  header.style.marginBottom = "12px";
  header.style.gap = "12px";

  const titleSection = document.createElement("div");
  titleSection.style.flex = "1";

  const title = document.createElement("h3");
  title.textContent = site.name;
  title.style.margin = "0 0 6px 0";
  title.style.fontSize = "20px";
  title.style.fontWeight = "700";
  title.style.color = "#111827";
  title.style.lineHeight = "1.3";

  const typeLabel = document.createElement("span");
  typeLabel.textContent =
    site.type.charAt(0).toUpperCase() + site.type.slice(1);
  typeLabel.style.display = "inline-block";
  typeLabel.style.padding = "4px 10px";
  typeLabel.style.borderRadius = "6px";
  typeLabel.style.fontSize = "12px";
  typeLabel.style.fontWeight = "600";
  typeLabel.style.color = COLOR_MAP[site.type] || "#3b82f6";
  typeLabel.style.background = (COLOR_MAP[site.type] || "#3b82f6") + "15";

  titleSection.appendChild(title);
  titleSection.appendChild(typeLabel);

  const desc = document.createElement("p");
  desc.textContent = site.description;
  desc.style.margin = "0 0 16px 0";
  desc.style.fontSize = "15px";
  desc.style.color = "#4b5563";
  desc.style.lineHeight = "1.6";

  const footer = document.createElement("div");
  footer.style.display = "flex";
  footer.style.alignItems = "center";
  footer.style.justifyContent = "space-between";
  footer.style.paddingTop = "16px";
  footer.style.borderTop = "1px solid #e5e7eb";

  const likeBtn = document.createElement("button");
  likeBtn.style.display = "flex";
  likeBtn.style.alignItems = "center";
  likeBtn.style.gap = "8px";
  likeBtn.style.background = "#f3f4f6";
  likeBtn.style.border = "none";
  likeBtn.style.cursor = "pointer";
  likeBtn.style.padding = "8px 12px";
  likeBtn.style.borderRadius = "8px";
  likeBtn.style.fontSize = "15px";
  likeBtn.style.fontWeight = "600";
  likeBtn.style.transition = "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)";

  const heartIcon = document.createElement("span");
  heartIcon.textContent = "🤍";
  heartIcon.style.fontSize = "20px";
  heartIcon.style.transition =
    "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";

  const likeCount = document.createElement("span");
  likeCount.textContent = site.initialLikes || 0;
  likeCount.style.color = "#6b7280";

  let liked = false;
  let count = site.initialLikes || 0;

  likeBtn.addEventListener("mouseenter", () => {
    likeBtn.style.background = liked ? "#fecaca" : "#e5e7eb";
    likeBtn.style.transform = "scale(1.05)";
  });
  likeBtn.addEventListener("mouseleave", () => {
    likeBtn.style.background = liked ? "#fee2e2" : "#f3f4f6";
    likeBtn.style.transform = "scale(1)";
  });
  likeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    liked = !liked;
    count = liked ? count + 1 : Math.max(0, count - 1);
    heartIcon.textContent = liked ? "❤️" : "🤍";
    likeCount.textContent = count;
    likeBtn.style.background = liked ? "#fee2e2" : "#f3f4f6";
    likeCount.style.color = liked ? "#dc2626" : "#6b7280";
    heartIcon.style.transform = "scale(1.4)";
    setTimeout(() => (heartIcon.style.transform = "scale(1)"), 400);
  });

  likeBtn.appendChild(heartIcon);
  likeBtn.appendChild(likeCount);

  const locationInfo = document.createElement("div");
  locationInfo.style.display = "flex";
  locationInfo.style.alignItems = "center";
  locationInfo.style.gap = "4px";
  locationInfo.style.color = "#9ca3af";
  locationInfo.style.fontSize = "13px";
  locationInfo.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg><span>İzmir, Turkey</span>`;

  footer.appendChild(likeBtn);
  footer.appendChild(locationInfo);

  header.appendChild(titleSection);
  content.appendChild(header);
  content.appendChild(desc);
  content.appendChild(footer);

  container.appendChild(img);
  container.appendChild(closeBtn);
  container.appendChild(content);

  return container;
};

const Map = ({ onMapReady }) => {
  const mapContainer = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style:
        "https://api.maptiler.com/maps/streets-v4/style.json?key=jhCcpBmLi8AmPxpV9Clp",
      center: [27.135, 38.423],
      zoom: 11,
      maxBounds: [
        [26.8, 38.1],
        [27.4, 38.6],
      ],
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "bottom-left"
    );

    map.on("style.load", () => {
      const style = map.getStyle();
      const layers = style?.layers;
      if (!layers) return;
      layers.forEach((layer) => {
        if (layer.id.toLowerCase().includes("poi") || layer.type === "symbol") {
          map.setLayoutProperty(layer.id, "visibility", "none");
        }
      });
    });

    onMapReady(map);
    return () => map.remove();
  }, [onMapReady]);

  return <div ref={mapContainer} className="w-full h-screen" />;
};

const CulturalMap = () => {
  const [mapInstance, setMapInstance] = useState(null);
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const markersRef = useRef({});
  const popupsRef = useRef({});

  useEffect(() => {
    if (!mapInstance) return;

    const markers = {};
    const popups = {};

    CULTURAL_SITES.forEach((site) => {
      const popup = new maplibregl.Popup({
        offset: 30,
        closeButton: false,
        closeOnClick: false,
        maxWidth: "360px",
      });

      const markerEl = createCulturalMarker(site, () => {
        if (activeMarkerId === site.id) {
          setActiveMarkerId(null);
        } else {
          setActiveMarkerId(site.id);
        }
      });

      const marker = new maplibregl.Marker({
        element: markerEl,
        anchor: "center",
      })
        .setLngLat(site.coordinates)
        .addTo(mapInstance);

      markers[site.id] = { marker, element: markerEl };
      popups[site.id] = popup;
    });

    markersRef.current = markers;
    popupsRef.current = popups;

    return () => {
      Object.values(markers).forEach(({ marker }) => marker.remove());
      Object.values(popups).forEach((popup) => popup.remove());
    };
  }, [mapInstance]);

  useEffect(() => {
    if (!mapInstance || !activeMarkerId) {
      Object.values(markersRef.current).forEach(({ element }) => {
        element.classList.remove("active");
      });
      Object.values(popupsRef.current).forEach((popup) => {
        popup.remove();
      });

      if (!activeMarkerId && mapInstance) {
        mapInstance.easeTo({
          center: [27.135, 38.423],
          zoom: 11,
          duration: 1200,
          easing: (t) => t * (2 - t),
        });
      }
      return;
    }

    const markerData = markersRef.current[activeMarkerId];
    const popup = popupsRef.current[activeMarkerId];
    const site = CULTURAL_SITES.find((s) => s.id === activeMarkerId);

    if (!markerData || !popup || !site) return;

    Object.entries(markersRef.current).forEach(([id, { element }]) => {
      if (id === activeMarkerId) {
        element.classList.add("active");
      } else {
        element.classList.remove("active");
      }
    });

    const popupContent = createPopupContent(site, () => {
      setActiveMarkerId(null);
    });

    popup.setDOMContent(popupContent);
    popup.setLngLat(site.coordinates);

    setTimeout(() => {
      popup.addTo(mapInstance);
    }, 100);

    mapInstance.easeTo({
      center: site.coordinates,
      zoom: 15,
      duration: 1200,
      easing: (t) => t * (2 - t),
    });

    const handleMapClick = (e) => {
      const clickedMarker = e.originalEvent.target.closest(".cultural-marker");
      if (!clickedMarker) {
        setActiveMarkerId(null);
      }
    };

    mapInstance.on("click", handleMapClick);

    return () => {
      mapInstance.off("click", handleMapClick);
      popup.remove();
    };
  }, [activeMarkerId, mapInstance]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Map onMapReady={setMapInstance} />

      <ImageUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImageUploaded={(url) => {
          console.log("✅ Image uploaded successfully!");
          alert(
            `✅ Image uploaded!\n\nCopy this URL and paste it in your CULTURAL_SITES array:\n\n${url}`
          );
        }}
      />

      <div className="absolute top-6 left-6 right-6 flex items-start justify-between gap-4 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-5 pointer-events-auto border border-gray-100 animate-slideInRight">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
            Categories
          </h3>
          <div className="space-y-2.5">
            {Object.entries(COLOR_MAP).map(([type, color], index) => {
              const Icon = ICON_MAP[type] || Sparkles;
              return (
                <div
                  key={type}
                  className="flex items-center gap-3 group cursor-pointer"
                  style={{
                    animation: `fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards ${index * 0.1}s`,
                    opacity: 0,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="w-4 h-4 text-white transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 capitalize group-hover:text-gray-900 transition-all duration-300 group-hover:translate-x-1">
                    {type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 font-medium transition-all duration-300 hover:scale-105 pointer-events-auto"
        >
          <Upload size={20} />
          Upload Image
        </button>
      </div>

      <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-lg rounded-xl shadow-lg px-5 py-3 pointer-events-auto border border-gray-100 animate-slideInBottom">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-gray-900">
            {CULTURAL_SITES.length} Cultural Sites
          </span>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInBottom {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .animate-slideInBottom {
          animation: slideInBottom 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.3s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default CulturalMap;
